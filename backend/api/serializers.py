from rest_framework import serializers, exceptions
from .models import User, Course, Chapter, Quiz, Question, StudentProgress, CourseRating, QuizAttempt
from django.contrib.auth import authenticate

# Login Serializer
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Incorrect Credentials")

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'first_name', 'last_name')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(validated_data['email'], validated_data['password'], first_name=validated_data['first_name'], last_name=validated_data['last_name'])
        return user

class UserSerializer(serializers.ModelSerializer):
    name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'name', 'role', 'avatar', 'total_xp', 'level', 'streak_days', 'created_at', 'updated_at']

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
    instructor = serializers.ReadOnlyField(source='teacher_name')  # For frontend compatibility
    duration = serializers.SerializerMethodField()
    enrolled_students = serializers.StringRelatedField(many=True, read_only=True)
    
    def get_duration(self, obj):
        # Calculate duration based on estimated hours
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
        fields = '__all__'

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