from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import (
    User,
    Course,
    Chapter,
    Quiz,
    Question,
    CourseRating,
    StudentProgress,
    QuizAttempt
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        'email', 'first_name', 'last_name', 'role', 'level', 'total_xp', 'is_active', 'is_staff')
    list_filter = (
        'role', 'is_active', 'is_staff', 'is_superuser', 'level', 'created_at')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)

    # Fieldsets for the detail view
    fieldsets = (
        ('Basic Information', {
            'fields': ('email', 'first_name', 'last_name', 'role', 'avatar')
        }),
        ('Gaming Stats', {
            'fields': ('total_xp', 'level', 'streak_days'),
            'classes': ('collapse',)
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    # Fields for adding a new user
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'role', 'password1', 'password2'),
        }),
    )

    readonly_fields = (
        'created_at', 'updated_at', 'total_xp', 'level', 'streak_days')


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'teacher', 'difficulty', 'estimated_hours', 'enrollment_count', 'created_at')
    list_filter = ('difficulty', 'created_at', 'teacher')
    search_fields = (
        'title', 'description', 'teacher__email', 'teacher__first_name', 'teacher__last_name')
    ordering = ('-created_at',)
    readonly_fields = (
        'created_at', 'updated_at', 'enrollment_count', 'average_rating')

    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'teacher', 'thumbnail', 'color')
        }),
        ('Course Details', {
            'fields': ('difficulty', 'estimated_hours', 'tags')
        }),
        ('Enrollment', {
            'fields': ('enrolled_students',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    filter_horizontal = ('enrolled_students',)


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'course', 'order', 'estimated_minutes', 'created_at')
    list_filter = ('course', 'created_at')
    search_fields = ('title', 'content', 'course__title')
    ordering = ('course', 'order')
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Chapter Information', {
            'fields': ('course', 'title', 'content', 'order', 'estimated_minutes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'course', 'type', 'passing_score', 'max_attempts', 'time_limit', 'created_at')
    list_filter = ('type', 'course', 'created_at')
    search_fields = ('title', 'description', 'course__title')
    ordering = ('course', 'type', '-created_at')
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Quiz Information', {
            'fields': ('title', 'description', 'course', 'chapter', 'type')
        }),
        ('Settings', {
            'fields': ('time_limit', 'passing_score', 'max_attempts')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = (
        'question', 'quiz', 'type', 'points', 'order', 'created_at')
    list_filter = ('type', 'quiz__course', 'created_at')
    search_fields = ('question', 'quiz__title', 'quiz__course__title')
    ordering = ('quiz', 'order')
    readonly_fields = ('created_at',)

    fieldsets = (
        ('Question Details', {
            'fields': ('quiz', 'question', 'type', 'options', 'correct_answer', 'explanation', 'points', 'order')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


@admin.register(CourseRating)
class CourseRatingAdmin(admin.ModelAdmin):
    list_display = ('course', 'student', 'rating', 'created_at')
    list_filter = ('rating', 'created_at', 'course')
    search_fields = (
        'course__title', 'student__email', 'student__first_name', 'student__last_name', 'review')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

    fieldsets = (
        ('Rating Information', {
            'fields': ('course', 'student', 'rating', 'review')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


@admin.register(StudentProgress)
class StudentProgressAdmin(admin.ModelAdmin):
    list_display = (
        'student', 'course', 'progress_percentage', 'completed', 'enrolled_at', 'last_accessed_at')
    list_filter = ('completed', 'enrolled_at', 'last_accessed_at', 'course')
    search_fields = (
        'student__email', 'student__first_name', 'student__last_name', 'course__title')
    ordering = ('-enrolled_at',)
    readonly_fields = (
        'enrolled_at', 'last_accessed_at', 'progress_percentage')

    fieldsets = (
        ('Progress Information', {
            'fields': ('student', 'course', 'enrolled_at', 'last_accessed_at', 'progress_percentage')
        }),
        ('Completion Status', {
            'fields': ('completed', 'completed_at', 'certificate_url')
        }),
        ('Scores & Progress', {
            'fields': (
                'completed_chapters', 'chapter_scores', 'quiz_scores', 'final_exam_score', 'final_exam_attempts', 'total_time_spent'),
            'classes': ('collapse',)
        }),
    )

    filter_horizontal = ('completed_chapters',)


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = (
        'student', 'quiz', 'score', 'time_taken', 'started_at', 'completed_at')
    list_filter = ('score', 'started_at', 'completed_at', 'quiz__course')
    search_fields = (
        'student__email', 'student__first_name', 'student__last_name', 'quiz__title')
    ordering = ('-started_at',)
    readonly_fields = ('started_at', 'completed_at')

    fieldsets = (
        ('Attempt Information', {
            'fields': ('student', 'quiz', 'score', 'time_taken', 'started_at', 'completed_at')
        }),
        ('Answers', {
            'fields': ('answers',),
            'classes': ('collapse',)
        }),
    )
