from rest_framework import serializers

from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

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


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(email=email, password=password)
            if user and user.is_active:
                attrs['user'] = user
                return attrs
            else:
                raise serializers.ValidationError("Incorrect Credentials")
        else:
            raise serializers.ValidationError(
                "Must include email and password")


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'first_name', 'last_name', 'role')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(  # type: ignore
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            role=validated_data.get('role', 'student')
        )
        return user


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate(self, attrs):
        self.token = attrs['refresh']
        return attrs

    def save(self, **kwargs):
        try:
            RefreshToken(self.token).blacklist()
        except TokenError:
            raise serializers.ValidationError('Invalid or expired token')


class UserSerializer(serializers.ModelSerializer):
    name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'name', 'role',
                  'avatar', 'total_xp', 'level', 'streak_days', 'created_at', 'updated_at']


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = '__all__'


class ChapterSerializer(serializers.ModelSerializer):
    quiz = QuizSerializer(read_only=True)
    duration = serializers.SerializerMethodField()

    def get_duration(self, obj):
        if obj.estimated_minutes:
            return f"{obj.estimated_minutes} min"
        return None

    class Meta:
        model = Chapter
        fields = '__all__'


class CourseSerializer(serializers.ModelSerializer):
    chapters = ChapterSerializer(many=True, read_only=True)
    final_exam = QuizSerializer(read_only=True)
    teacher = UserSerializer(read_only=True)
    teacher_id = serializers.ReadOnlyField()
    teacher_name = serializers.ReadOnlyField()
    enrollment_count = serializers.ReadOnlyField()
    rating = serializers.ReadOnlyField(source='average_rating')
    instructor = serializers.ReadOnlyField(
        source='teacher_name')  # For frontend compatibility
    duration = serializers.SerializerMethodField()
    enrolled_students = serializers.StringRelatedField(
        many=True, read_only=True)

    def get_duration(self, obj):
        if obj.estimated_hours:
            weeks = obj.estimated_hours // 40  # Assuming 40 hours per week
            if weeks == 0:
                return f"{obj.estimated_hours} hours"
            elif weeks == 1:
                return "1 week"
            else:
                return f"{weeks} weeks"
        return None

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'thumbnail', 'color', 'difficulty',
            'estimated_hours', 'tags', 'created_at', 'updated_at',
            'chapters', 'final_exam', 'teacher', 'teacher_id', 'teacher_name',
            'enrollment_count', 'rating', 'instructor', 'duration', 'enrolled_students'
        ]


class StudentProgressSerializer(serializers.ModelSerializer):
    student_id = serializers.ReadOnlyField(source='student.id')
    course_id = serializers.ReadOnlyField(source='course.id')
    progress_percentage = serializers.ReadOnlyField()

    class Meta:
        model = StudentProgress
        fields = '__all__'


class CourseRatingSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.name')

    class Meta:
        model = CourseRating
        fields = '__all__'


class QuizAttemptSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.name')
    quiz_title = serializers.ReadOnlyField(source='quiz.title')

    class Meta:
        model = QuizAttempt
        fields = '__all__'


class EnrollmentRequestSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_email = serializers.CharField(
        source='student.email', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    reviewed_by_name = serializers.CharField(
        source='reviewed_by.name', read_only=True)

    class Meta:
        model = EnrollmentRequest
        fields = ['id', 'student', 'student_name', 'student_email', 'course',
                  'course_title', 'status', 'requested_at', 'reviewed_at',
                  'reviewed_by', 'reviewed_by_name']
        read_only_fields = ['id', 'requested_at', 'reviewed_at', 'reviewed_by']
