
from .permissions import IsTeacherOrReadOnly
from rest_framework import viewsets, permissions, generics, status, serializers, parsers
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from django.db.models import Count, Avg, Q
from django.utils import timezone
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer, LogoutSerializer, CourseSerializer,
    ChapterSerializer, QuizSerializer, QuestionSerializer, StudentProgressSerializer,
    CourseRatingSerializer, QuizAttemptSerializer
)
from .models import User, Course, Chapter, Quiz, Question, StudentProgress, CourseRating, QuizAttempt

# Custom login serializer that includes user data


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'
    
    def validate(self, attrs):
        # Get email and password from attrs
        email = attrs.get('email')
        password = attrs.get('password')
        
        # Authenticate user
        user = authenticate(email=email, password=password)
        
        if user is None or not user.is_active:
            raise serializers.ValidationError(
                {'error': 'Invalid credentials'},
                code='authorization'
            )
        
        # Generate tokens using parent class method
        refresh = self.get_token(user)
        
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': user
        }
        
        return data
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims if needed
        token['email'] = user.email
        token['role'] = user.role
        return token

# Register API


class RegisterAPI(generics.GenericAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Create JWT tokens for the newly registered user
        refresh = RefreshToken.for_user(user)

        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

# Login API


class LoginAPI(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        # Use CustomTokenObtainPairSerializer for authentication
        serializer = CustomTokenObtainPairSerializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
            validated_data = serializer.validated_data
            
            user = validated_data.get('user')
            
            return Response({
                "user": UserSerializer(user, context=self.get_serializer_context()).data,
                "refresh": validated_data.get('refresh'),
                "access": validated_data.get('access'),
            }, status=status.HTTP_200_OK)
            
        except serializers.ValidationError as e:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

# Get User API


class UserAPI(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated,]
    serializer_class = UserSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_object(self):
        return self.request.user

# Logout API


class LogoutAPI(generics.GenericAPIView):
    serializer_class = LogoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(
                {"message": "Successfully logged out"},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": "Failed to logout"},
                status=status.HTTP_400_BAD_REQUEST
            )

# Course Viewset


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsTeacherOrReadOnly,]

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, pk=None):
        course = self.get_object()
        student = request.user

        if student.role != 'student':
            return Response({'error': 'Only students can enroll in courses'}, status=status.HTTP_400_BAD_REQUEST)

        if student in course.enrolled_students.all():
            return Response({'error': 'Already enrolled in this course'}, status=status.HTTP_400_BAD_REQUEST)

        course.enrolled_students.add(student)
        # Create progress tracking
        StudentProgress.objects.get_or_create(student=student, course=course)

        return Response({'message': 'Successfully enrolled in course'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def rate(self, request, pk=None):
        course = self.get_object()
        student = request.user
        rating_value = request.data.get('rating')
        review_text = request.data.get('review', '')

        if not rating_value or rating_value < 1 or rating_value > 5:
            return Response({'error': 'Rating must be between 1 and 5'}, status=status.HTTP_400_BAD_REQUEST)

        rating, created = CourseRating.objects.update_or_create(
            course=course, student=student,
            defaults={'rating': rating_value, 'review': review_text}
        )

        serializer = CourseRatingSerializer(rating)
        return Response(serializer.data, status=status.HTTP_200_OK)

# Chapter Viewset


class ChapterViewSet(viewsets.ModelViewSet):
    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializer
    permission_classes = [IsTeacherOrReadOnly,]

# Quiz Viewset


class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [IsTeacherOrReadOnly,]

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def submit(self, request, pk=None):
        quiz = self.get_object()
        student = request.user
        answers = request.data.get('answers', {})

        # Calculate score
        correct_answers = 0
        total_points = 0
        earned_points = 0

        for question in quiz.questions.all():
            total_points += question.points
            user_answer = answers.get(str(question.id))
            if user_answer is not None and int(user_answer) == question.correct_answer:
                correct_answers += 1
                earned_points += question.points

        score_percentage = (earned_points / total_points *
                            100) if total_points > 0 else 0

        # Create quiz attempt
        attempt = QuizAttempt.objects.create(
            student=student,
            quiz=quiz,
            answers=answers,
            score=score_percentage,
            time_taken=request.data.get('time_taken', 0)
        )

        return Response({
            'score': score_percentage,
            'passed': score_percentage >= quiz.passing_score,
            'correct_answers': correct_answers,
            'total_questions': quiz.questions.count()
        }, status=status.HTTP_200_OK)

# Question Viewset


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsTeacherOrReadOnly,]

# StudentProgress Viewset


class StudentProgressViewSet(viewsets.ModelViewSet):
    queryset = StudentProgress.objects.all()
    serializer_class = StudentProgressSerializer
    permission_classes = [permissions.IsAuthenticated,]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return StudentProgress.objects.filter(student=user)
        elif user.role == 'teacher':
            return StudentProgress.objects.filter(course__teacher=user)
        return StudentProgress.objects.none()

    @action(detail=True, methods=['post'])
    def complete_chapter(self, request, pk=None):
        progress = self.get_object()
        chapter_id = request.data.get('chapter_id')
        score = request.data.get('score', 100)

        try:
            chapter = Chapter.objects.get(
                id=chapter_id, course=progress.course)
            progress.completed_chapters.add(chapter)
            progress.chapter_scores[str(chapter_id)] = score
            progress.save()

            # Check if course is completed
            total_chapters = progress.course.chapters.count()
            completed_chapters = progress.completed_chapters.count()

            if completed_chapters >= total_chapters:
                progress.completed = True
                progress.completed_at = timezone.now()
                progress.save()

            return Response({'message': 'Chapter completed successfully'}, status=status.HTTP_200_OK)
        except Chapter.DoesNotExist:
            return Response({'error': 'Chapter not found'}, status=status.HTTP_404_NOT_FOUND)

# Teacher Dashboard API


class TeacherDashboardAPI(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'teacher':
            return Response({'error': 'Access denied. Teacher role required.'}, status=status.HTTP_403_FORBIDDEN)

        teacher = request.user
        courses = Course.objects.filter(teacher=teacher)

        # Calculate statistics
        total_courses = courses.count()
        total_students = StudentProgress.objects.filter(
            course__teacher=teacher).values('student').distinct().count()
        avg_rating = courses.aggregate(avg_rating=Avg('ratings__rating'))[
            'avg_rating'] or 0
        completion_rate = StudentProgress.objects.filter(
            course__teacher=teacher, completed=True
        ).count() / max(StudentProgress.objects.filter(course__teacher=teacher).count(), 1) * 100

        # Recent enrollments
        recent_enrollments = StudentProgress.objects.filter(
            course__teacher=teacher
        ).order_by('-enrolled_at')[:5]

        # Course performance
        course_stats = []
        for course in courses:
            stats = {
                'course_id': course.id,
                'course_title': course.title,
                'enrollment_count': course.enrollment_count,
                'completion_rate': course.student_progress.filter(completed=True).count() / max(course.student_progress.count(), 1) * 100,
                'average_rating': course.average_rating
            }
            course_stats.append(stats)

        return Response({
            'teacher_info': UserSerializer(teacher).data,
            'statistics': {
                'total_courses': total_courses,
                'total_students': total_students,
                'average_rating': round(avg_rating, 1),
                'completion_rate': round(completion_rate, 1)
            },
            'recent_enrollments': StudentProgressSerializer(recent_enrollments, many=True).data,
            'course_performance': course_stats,
            'recent_activity': self.get_recent_activity(teacher)
        })

    def get_recent_activity(self, teacher):
        # Get recent quiz attempts, enrollments, etc.
        recent_attempts = QuizAttempt.objects.filter(
            quiz__course__teacher=teacher
        ).order_by('-started_at')[:10]

        activity = []
        for attempt in recent_attempts:
            activity.append({
                'type': 'quiz_completion',
                'student_name': attempt.student.name,
                'course_title': attempt.quiz.course.title,
                'quiz_title': attempt.quiz.title,
                'score': attempt.score,
                'timestamp': attempt.started_at
            })

        return activity[:5]  # Return last 5 activities

# Course Analytics API


class CourseAnalyticsAPI(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id):
        if request.user.role != 'teacher':
            return Response({'error': 'Access denied. Teacher role required.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            course = Course.objects.get(id=course_id, teacher=request.user)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

        # Analytics data
        progress_data = StudentProgress.objects.filter(course=course)

        analytics = {
            'course_info': CourseSerializer(course).data,
            'enrollment_trends': self.get_enrollment_trends(course),
            'completion_rates': self.get_completion_rates(course),
            'chapter_performance': self.get_chapter_performance(course),
            'student_performance': self.get_student_performance(course)
        }

        return Response(analytics)

    def get_enrollment_trends(self, course):
        # Weekly enrollment data for the last 12 weeks
        from datetime import timedelta

        weeks = []
        for i in range(12):
            start_date = timezone.now() - timedelta(weeks=i+1)
            end_date = timezone.now() - timedelta(weeks=i)
            enrollments = StudentProgress.objects.filter(
                course=course,
                enrolled_at__range=[start_date, end_date]
            ).count()
            weeks.append({
                'week': f"Week {12-i}",
                'enrollments': enrollments
            })

        return weeks

    def get_completion_rates(self, course):
        total_enrolled = course.student_progress.count()
        completed = course.student_progress.filter(completed=True).count()
        in_progress = total_enrolled - completed

        return {
            'completed': completed,
            'in_progress': in_progress,
            'completion_percentage': (completed / max(total_enrolled, 1)) * 100
        }

    def get_chapter_performance(self, course):
        chapters = course.chapters.all()
        performance = []

        for chapter in chapters:
            completed_count = chapter.completed_by.count()
            total_enrolled = course.student_progress.count()

            performance.append({
                'chapter_id': chapter.id,
                'chapter_title': chapter.title,
                'completion_rate': (completed_count / max(total_enrolled, 1)) * 100,
                'average_score': StudentProgress.objects.filter(
                    course=course,
                    chapter_scores__contains={str(chapter.id): {}}
                ).aggregate(
                    avg_score=Avg('chapter_scores__' + str(chapter.id))
                )['avg_score'] or 0
            })

        return performance

    def get_student_performance(self, course):
        students = course.student_progress.all()
        performance = []

        for progress in students:
            performance.append({
                'student_id': progress.student.id,
                'student_name': progress.student.name,
                'progress_percentage': progress.progress_percentage,
                'completed_chapters': progress.completed_chapters.count(),
                'total_chapters': course.chapters.count(),
                'average_score': sum(progress.chapter_scores.values()) / max(len(progress.chapter_scores), 1),
                'last_accessed': progress.last_accessed_at
            })

        return performance
