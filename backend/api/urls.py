
from django.urls import path, include
from .views import (
    RegisterAPI, LoginAPI, UserAPI, CourseViewSet, ChapterViewSet, 
    QuizViewSet, QuestionViewSet, StudentProgressViewSet,
    TeacherDashboardAPI, CourseAnalyticsAPI
)
from rest_framework.routers import DefaultRouter
from knox import views as knox_views

router = DefaultRouter()
router.register('courses', CourseViewSet, basename='courses')
router.register('chapters', ChapterViewSet, basename='chapters')
router.register('quizzes', QuizViewSet, basename='quizzes')
router.register('questions', QuestionViewSet, basename='questions')
router.register('progress', StudentProgressViewSet, basename='progress')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/', include('knox.urls')), 
    path('auth/register/', RegisterAPI.as_view(), name='register'),
    path('auth/login/', LoginAPI.as_view(), name='login'),
    path('auth/user/', UserAPI.as_view(), name='user'),
    path('auth/logout/', knox_views.LogoutView.as_view(), name='knox_logout'),
    path('teacher/dashboard/', TeacherDashboardAPI.as_view(), name='teacher_dashboard'),
    path('teacher/analytics/<uuid:course_id>/', CourseAnalyticsAPI.as_view(), name='course_analytics'),
]
