
from django.urls import path, include
from .views import (
    RegisterAPI, LoginAPI, LogoutAPI, UserAPI, CourseViewSet, ChapterViewSet, 
    QuizViewSet, QuestionViewSet, StudentProgressViewSet,
    TeacherDashboardAPI, CourseAnalyticsAPI
)
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

router = DefaultRouter()
router.register('courses', CourseViewSet, basename='courses')
router.register('chapters', ChapterViewSet, basename='chapters')
router.register('quizzes', QuizViewSet, basename='quizzes')
router.register('questions', QuestionViewSet, basename='questions')
router.register('progress', StudentProgressViewSet, basename='progress')

urlpatterns = [
    path('', include(router.urls)),
    
    # Auth endpoints - Custom
    path('auth/register/', RegisterAPI.as_view(), name='register'),
    path('auth/login/', LoginAPI.as_view(), name='login'),
    path('auth/logout/', LogoutAPI.as_view(), name='logout'),
    path('auth/user/', UserAPI.as_view(), name='user'),
    
    # Auth endpoints - Simple JWT
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Teacher endpoints
    path('teacher/dashboard/', TeacherDashboardAPI.as_view(), name='teacher_dashboard'),
    path('teacher/analytics/<uuid:course_id>/', CourseAnalyticsAPI.as_view(), name='course_analytics'),
]
