
from rest_framework import (
    viewsets,
    permissions,
    generics,
    status,
    serializers,
    parsers
)
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from datetime import timedelta
from django.utils import timezone
from django.db.models import Avg, Q
from django.contrib.auth import authenticate

from .models import (
    User,
    Course,
    Chapter,
    Quiz,
    Question,
    StudentProgress,
    CourseRating,
    QuizAttempt,
    EnrollmentRequest
)
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    LogoutSerializer,
    CourseSerializer,
    ChapterSerializer,
    QuizSerializer,
    QuestionSerializer,
    StudentProgressSerializer,
    CourseRatingSerializer,
    EnrollmentRequestSerializer
)
from .permissions import IsTeacherOrReadOnly


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        remember_me = attrs.get('remember_me', False)

        user = authenticate(email=email, password=password)

        if user is None or not user.is_active:
            raise serializers.ValidationError(
                {'error': 'Invalid credentials'},
                code='authorization'
            )

        refresh = self.get_token(user)

        if remember_me:
            refresh.set_exp(lifetime=timedelta(days=7))
        else:
            refresh.set_exp(lifetime=timedelta(days=1))

        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token), # type: ignore
            'user': user
        }

        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        return token



class RegisterAPI(generics.GenericAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)



class LoginAPI(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = CustomTokenObtainPairSerializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
            validated_data = serializer.validated_data

            user = validated_data.get('user') # type: ignore

            return Response({
                "user": UserSerializer(user, context=self.get_serializer_context()).data,
                "refresh": validated_data.get('refresh'), # type: ignore
                "access": validated_data.get('access'), # type: ignore
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



class UserAPI(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated,]
    serializer_class = UserSerializer
    parser_classes = [parsers.MultiPartParser,
                      parsers.FormParser, parsers.JSONParser]

    def get_object(self): # type: ignore
        return self.request.user



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

    def get_queryset(self): # type: ignore
        user = self.request.user
        if user.role == 'teacher': # type: ignore
            return Course.objects.filter(teacher=user)
        return Course.objects.all()

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def available(self, request):
        """Get courses available for enrollment (not already enrolled)"""
        student = request.user

        if student.role != 'student':
            return Response({'error': 'Only students can view available courses'}, status=status.HTTP_400_BAD_REQUEST)

        enrolled_course_ids = student.enrolled_courses.values_list(
            'id', flat=True)
        available_courses = Course.objects.exclude(id__in=enrolled_course_ids)

        serializer = self.get_serializer(available_courses, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def enrolled(self, request):
        """Get courses the student is enrolled in"""
        student = request.user

        if student.role != 'student':
            return Response({'error': 'Only students can view enrolled courses'}, status=status.HTTP_400_BAD_REQUEST)

        enrolled_courses = student.enrolled_courses.all()
        courses_data = []

        for course in enrolled_courses:
            progress_obj, created = StudentProgress.objects.get_or_create(
                student=student, course=course
            )
            progress_percentage = progress_obj.progress_percentage

            course_data = CourseSerializer(course).data
            course_data['progress'] = progress_percentage # type: ignore
            course_data['average_score'] = progress_obj.final_exam_score or 0 # type: ignore
            courses_data.append(course_data)

        return Response(courses_data)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def students(self, request, pk=None):
        """Get students enrolled in a specific course (for teachers only)"""
        course = self.get_object()

        if course.teacher != request.user:
            return Response({'error': 'Only the course teacher can view enrolled students'}, status=status.HTTP_403_FORBIDDEN)

        # Get students enrolled in this course with their progress
        enrolled_students = []
        for student in course.enrolled_students.all():
            progress_obj = StudentProgress.objects.filter(
                student=student, course=course).first()
            progress_percentage = progress_obj.progress_percentage if progress_obj else 0

            student_data = {
                'id': str(student.id),
                'name': student.name,
                'email': student.email,
                'enrolled_at': progress_obj.enrolled_at if progress_obj else None,
                'progress': progress_percentage,
                'completed': progress_obj.completed if progress_obj else False,
                'average_score': progress_obj.final_exam_score if progress_obj else 0,
            }
            enrolled_students.append(student_data)

        return Response(enrolled_students)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def dismiss_student(self, request, pk=None):
        """Dismiss a student from a course (for teachers only)"""
        course = self.get_object()
        student_id = request.data.get('student_id')

        if course.teacher != request.user:
            return Response({'error': 'Only the course teacher can dismiss students'}, status=status.HTTP_403_FORBIDDEN)

        try:
            student = User.objects.get(id=student_id, role='student')
        except User.DoesNotExist:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

        if student not in course.enrolled_students.all():
            return Response({'error': 'Student is not enrolled in this course'}, status=status.HTTP_400_BAD_REQUEST)

        # Remove student from course
        course.enrolled_students.remove(student)

        # Delete progress record
        StudentProgress.objects.filter(student=student, course=course).delete()

        return Response({'message': 'Student dismissed from course successfully'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, pk=None):
        course = self.get_object()
        student = request.user

        if student.role != 'student':
            return Response({'error': 'Only students can request enrollment in courses'}, status=status.HTTP_400_BAD_REQUEST)

        if student in course.enrolled_students.all():
            return Response({'error': 'Already enrolled in this course'}, status=status.HTTP_400_BAD_REQUEST)

        existing_request = EnrollmentRequest.objects.filter(
            student=student, course=course
        ).first()

        if existing_request:
            if existing_request.status == 'pending':
                return Response({'error': 'Enrollment request already pending'}, status=status.HTTP_400_BAD_REQUEST)
            elif existing_request.status == 'approved':
                return Response({'error': 'Already enrolled in this course'}, status=status.HTTP_400_BAD_REQUEST)
            elif existing_request.status == 'rejected':
                return Response({'error': 'Previous enrollment request was rejected'}, status=status.HTTP_400_BAD_REQUEST)

        enrollment_request = EnrollmentRequest.objects.create(
            student=student,
            course=course
        )

        return Response({
            'message': 'Enrollment request submitted successfully',
            'request_id': enrollment_request.id,
            'status': 'pending'
        }, status=status.HTTP_201_CREATED)

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

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def enrollment_requests(self, request, pk=None):
        """Get enrollment requests for a course (teachers only)"""
        course = self.get_object()

        if request.user != course.teacher:
            return Response({'error': 'Only the course teacher can view enrollment requests'}, status=status.HTTP_403_FORBIDDEN)

        requests = EnrollmentRequest.objects.filter(
            course=course).order_by('-requested_at')
        serializer = EnrollmentRequestSerializer(requests, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def approve_enrollment(self, request, pk=None):
        """Approve an enrollment request (teachers only)"""
        course = self.get_object()
        request_id = request.data.get('request_id')

        if request.user != course.teacher:
            return Response({'error': 'Only the course teacher can approve enrollment requests'}, status=status.HTTP_403_FORBIDDEN)

        try:
            enrollment_request = EnrollmentRequest.objects.get(
                id=request_id, course=course, status='pending'
            )
            enrollment_request.approve(request.user)
            return Response({'message': 'Enrollment request approved successfully'})
        except EnrollmentRequest.DoesNotExist:
            return Response({'error': 'Enrollment request not found or already processed'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reject_enrollment(self, request, pk=None):
        """Reject an enrollment request (teachers only)"""
        course = self.get_object()
        request_id = request.data.get('request_id')

        if request.user != course.teacher:
            return Response({'error': 'Only the course teacher can reject enrollment requests'}, status=status.HTTP_403_FORBIDDEN)

        try:
            enrollment_request = EnrollmentRequest.objects.get(
                id=request_id, course=course, status='pending'
            )
            enrollment_request.reject(request.user)
            return Response({'message': 'Enrollment request rejected successfully'})
        except EnrollmentRequest.DoesNotExist:
            return Response({'error': 'Enrollment request not found or already processed'}, status=status.HTTP_404_NOT_FOUND)



class ChapterViewSet(viewsets.ModelViewSet):
    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializer
    permission_classes = [IsTeacherOrReadOnly,]

    def get_queryset(self): # type: ignore
        queryset = Chapter.objects.all()
        course_id = self.request.query_params.get('course', None) # type: ignore
        if course_id is not None:
            queryset = queryset.filter(course_id=course_id)
        return queryset



class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [IsTeacherOrReadOnly,]

    def get_queryset(self): # type: ignore
        queryset = Quiz.objects.all()
        course_id = self.request.query_params.get('course', None) # type: ignore
        if course_id is not None:
            queryset = queryset.filter(course_id=course_id)
        return queryset

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



class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsTeacherOrReadOnly,]



class StudentProgressViewSet(viewsets.ModelViewSet):
    queryset = StudentProgress.objects.all()
    serializer_class = StudentProgressSerializer
    permission_classes = [permissions.IsAuthenticated,]

    def get_queryset(self): # type: ignore
        user = self.request.user
        if user.role == 'student': # type: ignore
            return StudentProgress.objects.filter(student=user)
        elif user.role == 'teacher': # type: ignore
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

            total_chapters = progress.course.chapters.count()
            completed_chapters = progress.completed_chapters.count()

            if completed_chapters >= total_chapters:
                progress.completed = True
                progress.completed_at = timezone.now()
                progress.save()

            return Response({'message': 'Chapter completed successfully'}, status=status.HTTP_200_OK)
        except Chapter.DoesNotExist:
            return Response({'error': 'Chapter not found'}, status=status.HTTP_404_NOT_FOUND)



class TeacherDashboardAPI(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'teacher':
            return Response({'error': 'Access denied. Teacher role required.'}, status=status.HTTP_403_FORBIDDEN)

        teacher = request.user
        courses = Course.objects.filter(teacher=teacher)

        total_courses = courses.count()
        total_students = StudentProgress.objects.filter(
            course__teacher=teacher).values('student').distinct().count()
        avg_rating = courses.aggregate(avg_rating=Avg('ratings__rating'))[
            'avg_rating'] or 0
        completion_rate = StudentProgress.objects.filter(
            course__teacher=teacher, completed=True
        ).count() / max(StudentProgress.objects.filter(course__teacher=teacher).count(), 1) * 100

        recent_enrollments = StudentProgress.objects.filter(
            course__teacher=teacher
        ).order_by('-enrolled_at')[:5]

        course_stats = []
        for course in courses:
            stats = {
                'course_id': course.id,
                'course_title': course.title,
                'enrollment_count': course.enrollment_count,
                'completion_rate': course.student_progress.filter(completed=True).count() / max(course.student_progress.count(), 1) * 100, # type: ignore
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

        return activity[:5] 



class CourseAnalyticsAPI(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id):
        if request.user.role != 'teacher':
            return Response({'error': 'Access denied. Teacher role required.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            course = Course.objects.get(id=course_id, teacher=request.user)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

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


class EnrollmentRequestViewSet(viewsets.ModelViewSet):
    queryset = EnrollmentRequest.objects.all()
    serializer_class = EnrollmentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self): # type: ignore
        user = self.request.user
        if user.role == 'teacher': # type: ignore
            return EnrollmentRequest.objects.filter(course__teacher=user)
        elif user.role == 'student': # type: ignore
            return EnrollmentRequest.objects.filter(student=user)
        return EnrollmentRequest.objects.none()

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def approve(self, request):
        """Approve an enrollment request"""
        request_id = request.data.get('request_id')
        try:
            enrollment_request = self.get_queryset().get(id=request_id, status='pending')
            enrollment_request.approve(request.user)
            return Response({'message': 'Enrollment request approved successfully'})
        except EnrollmentRequest.DoesNotExist:
            return Response({'error': 'Enrollment request not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reject(self, request):
        """Reject an enrollment request"""
        request_id = request.data.get('request_id')
        try:
            enrollment_request = self.get_queryset().get(id=request_id, status='pending')
            enrollment_request.reject(request.user)
            return Response({'message': 'Enrollment request rejected successfully'})
        except EnrollmentRequest.DoesNotExist:
            return Response({'error': 'Enrollment request not found'}, status=status.HTTP_404_NOT_FOUND)
