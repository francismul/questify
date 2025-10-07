
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
import uuid

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('teacher', 'Teacher'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    avatar = models.URLField(blank=True)
    total_xp = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    streak_days = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    @property
    def name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.email

    def __str__(self):
        return self.email


class Course(models.Model):
    DIFFICULTY_CHOICES = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses_taught')
    thumbnail = models.URLField(blank=True)
    color = models.CharField(max_length=50, default='#3B82F6')
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    estimated_hours = models.IntegerField()
    enrolled_students = models.ManyToManyField(User, related_name='enrolled_courses', blank=True)
    tags = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def teacher_id(self):
        return str(self.teacher.id)
    
    @property
    def teacher_name(self):
        return self.teacher.name
    
    @property
    def enrollment_count(self):
        return self.enrolled_students.count()
    
    @property
    def average_rating(self):
        ratings = self.ratings.all()
        if ratings.exists():
            return ratings.aggregate(models.Avg('rating'))['rating__avg']
        return 0.0
    
    @property
    def final_exam(self):
        try:
            return self.quizzes.get(type='final')
        except Quiz.DoesNotExist:
            return None

    def __str__(self):
        return self.title


class Chapter(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='chapters')
    title = models.CharField(max_length=255)
    content = models.TextField()
    order = models.IntegerField()
    estimated_minutes = models.IntegerField(default=30)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']
        unique_together = ('course', 'order')

    def __str__(self):
        return f"{self.course.title} - {self.title}"

class Quiz(models.Model):
    QUIZ_TYPES = (
        ('chapter', 'Chapter Quiz'),
        ('final', 'Final Exam'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quizzes')
    chapter = models.OneToOneField(Chapter, on_delete=models.CASCADE, related_name='quiz', null=True, blank=True)
    time_limit = models.IntegerField(null=True, blank=True)  # in minutes
    passing_score = models.IntegerField(default=70)  # percentage
    max_attempts = models.IntegerField(default=3)  # Renamed from 'attempts' to avoid conflict
    type = models.CharField(max_length=10, choices=QUIZ_TYPES, default='chapter')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.course.title} - {self.title}"

class Question(models.Model):
    QUESTION_TYPES = (
        ('multiple-choice', 'Multiple Choice'),
        ('true-false', 'True/False'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question = models.TextField()
    type = models.CharField(max_length=20, choices=QUESTION_TYPES, default='multiple-choice')
    options = models.JSONField(default=list)  # List of strings
    correct_answer = models.IntegerField()  # Index of correct option
    explanation = models.TextField(blank=True)
    points = models.IntegerField(default=1)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']
        unique_together = ('quiz', 'order')

    def __str__(self):
        return f"{self.quiz.title} - Question {self.order + 1}"

class CourseRating(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='ratings')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_ratings')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])  # 1-5 stars
    review = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('course', 'student')

    def __str__(self):
        return f"{self.course.title} - {self.rating} stars"

class StudentProgress(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='student_progress')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_chapters = models.ManyToManyField(Chapter, related_name='completed_by', blank=True)
    chapter_scores = models.JSONField(default=dict)  # chapter_id -> score percentage
    quiz_scores = models.JSONField(default=dict)  # quiz_id -> score percentage
    final_exam_score = models.IntegerField(null=True, blank=True)
    final_exam_attempts = models.IntegerField(default=0)
    total_time_spent = models.IntegerField(default=0)  # in minutes
    last_accessed_at = models.DateTimeField(auto_now=True)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    certificate_url = models.URLField(blank=True)

    class Meta:
        unique_together = ('student', 'course')

    @property
    def progress_percentage(self):
        if not self.course.chapters.exists():
            return 0
        completed_count = self.completed_chapters.count()
        total_count = self.course.chapters.count()
        return (completed_count / total_count) * 100 if total_count > 0 else 0

    def __str__(self):
        return f"{self.student.name} - {self.course.title}"

class QuizAttempt(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    answers = models.JSONField(default=dict)  # question_id -> selected_answer_index
    score = models.IntegerField()  # percentage
    time_taken = models.IntegerField()  # in minutes
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.student.name} - {self.quiz.title} - {self.score}%"
