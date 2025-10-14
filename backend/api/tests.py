from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from .models import (
    User,
    Course,
    Chapter,
    Quiz,
    Question,
    StudentProgress,
    EnrollmentRequest
)


class AuthTests(APITestCase):

    def setUp(self):
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.user_url = reverse('user')
        self.logout_url = reverse('logout')

        self.user_data = {
            'email': 'test@example.com',
            'password': 'testpassword123',
            'first_name': 'Test',
            'last_name': 'User'
        }
        self.user = User.objects.create_user(**self.user_data)  # type: ignore

    def test_register_success(self):
        """
        Ensure we can register a new user.
        """
        data = {
            'email': 'newuser@example.com',
            'password': 'newpassword123',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)  # type: ignore
        self.assertIn('refresh', response.data)  # type: ignore
        self.assertEqual(response.data['user']['email'], data['email']) # type: ignore

    def test_register_existing_email(self):
        """
        Ensure we cannot register with an existing email.
        """
        data = {
            'email': self.user_data['email'],
            'password': 'anotherpassword',
            'first_name': 'Another',
            'last_name': 'User'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        """
        Ensure we can log in with correct credentials.
        """
        data = {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)# type: ignore
        self.assertIn('refresh', response.data)# type: ignore
        self.client.credentials(# type: ignore
            HTTP_AUTHORIZATION='Bearer ' + response.data['access'])# type: ignore

    def test_login_failure(self):
        """
        Ensure login fails with incorrect credentials.
        """
        data = {
            'email': self.user_data['email'],
            'password': 'wrongpassword'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_user_authenticated(self):
        """
        Ensure an authenticated user can retrieve their profile.
        """
        self.client.force_authenticate(user=self.user)# type: ignore
        response = self.client.get(self.user_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.user_data['email'])# type: ignore

    def test_get_user_unauthenticated(self):
        """
        Ensure an unauthenticated user cannot retrieve a profile.
        """
        response = self.client.get(self.user_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout(self):
        """
        Ensure we can log out.
        """
        login_data = {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        }
        login_response = self.client.post(
            self.login_url, login_data, format='json')
        refresh_token = login_response.data['refresh']# type: ignore

        self.client.credentials(# type: ignore
            HTTP_AUTHORIZATION='Bearer ' + login_response.data['access'])# type: ignore

        logout_data = {'refresh': refresh_token}
        response = self.client.post(
            self.logout_url, logout_data, format='json')

        # The simplejwt blacklist app is not installed, so a 200 OK is expected
        # even if the token is not truly invalidated on the server-side without it.
        # The client is expected to discard the token.
        self.assertIn(response.status_code, [
                      status.HTTP_200_OK, status.HTTP_204_NO_CONTENT])


class CourseTests(APITestCase):

    def setUp(self):
        self.teacher = User.objects.create_user(# type: ignore
            email='teacher@example.com',
            password='teacherpassword',
            first_name='Teacher',
            last_name='User',
            role='teacher'
        )
        self.student = User.objects.create_user(# type: ignore
            email='student@example.com',
            password='studentpassword',
            first_name='Student',
            last_name='User',
            role='student'
        )
        self.course = Course.objects.create(
            title='Test Course',
            description='A course for testing',
            teacher=self.teacher,
            estimated_hours=10
        )

        self.course_list_url = reverse('courses-list')
        self.course_detail_url = reverse(
            'courses-detail', kwargs={'pk': self.course.pk})

    def test_list_courses_unauthenticated(self):
        response = self.client.get(self.course_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_courses_authenticated(self):
        self.client.force_authenticate(user=self.student)# type: ignore
        response = self.client.get(self.course_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)# type: ignore

    def test_retrieve_course(self):
        response = self.client.get(self.course_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], self.course.title)# type: ignore

    def test_create_course_as_teacher(self):
        self.client.force_authenticate(user=self.teacher)# type: ignore
        data = {
            'title': 'New Course',
            'description': 'A new course',
            'estimated_hours': 5
        }
        response = self.client.post(self.course_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_course_as_student(self):
        self.client.force_authenticate(user=self.student)# type: ignore
        data = {
            'title': 'New Course',
            'description': 'A new course',
            'estimated_hours': 5
        }
        response = self.client.post(self.course_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_enroll_course_as_student(self):
        self.client.force_authenticate(user=self.student)# type: ignore
        url = reverse('courses-enroll', kwargs={'pk': self.course.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Check that enrollment request was created
        self.assertTrue(EnrollmentRequest.objects.filter(
            student=self.student, course=self.course, status='pending'
        ).exists())
        # Student should not be directly enrolled
        self.assertNotIn(self.student, self.course.enrolled_students.all())

    def test_enroll_course_as_teacher(self):
        self.client.force_authenticate(user=self.teacher)# type: ignore
        url = reverse('courses-enroll', kwargs={'pk': self.course.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_rate_course_as_student(self):
        self.client.force_authenticate(user=self.student)# type: ignore
        self.course.enrolled_students.add(self.student)
        url = reverse('courses-rate', kwargs={'pk': self.course.pk})
        data = {'rating': 5, 'review': 'Great course!'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['rating'], 5)# type: ignore


class ChapterTests(APITestCase):

    def setUp(self):
        self.teacher = User.objects.create_user(# type: ignore
            email='teacher@example.com',
            password='teacherpassword',
            role='teacher'
        )
        self.student = User.objects.create_user(# type: ignore
            email='student@example.com',
            password='studentpassword',
            role='student'
        )
        self.course = Course.objects.create(
            title='Test Course',
            teacher=self.teacher,
            estimated_hours=10
        )
        self.chapter = Chapter.objects.create(
            course=self.course,
            title='Test Chapter',
            content='Chapter content',
            order=1
        )

        self.chapter_list_url = reverse('chapters-list')
        self.chapter_detail_url = reverse(
            'chapters-detail', kwargs={'pk': self.chapter.pk})

    def test_list_chapters(self):
        response = self.client.get(self.chapter_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)# type: ignore

    def test_retrieve_chapter(self):
        response = self.client.get(self.chapter_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], self.chapter.title)# type: ignore

    def test_create_chapter_as_teacher(self):
        self.client.force_authenticate(user=self.teacher)# type: ignore
        data = {
            'course': self.course.pk,
            'title': 'New Chapter',
            'content': 'More content',
            'order': 2
        }
        response = self.client.post(self.chapter_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_chapter_as_student(self):
        self.client.force_authenticate(user=self.student)# type: ignore
        data = {
            'course': self.course.pk,
            'title': 'New Chapter',
            'content': 'More content',
            'order': 2
        }
        response = self.client.post(self.chapter_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class QuizTests(APITestCase):

    def setUp(self):
        self.teacher = User.objects.create_user(# type: ignore
            email='teacher@example.com', password='password', role='teacher')
        self.student = User.objects.create_user(# type: ignore
            email='student@example.com', password='password', role='student')
        self.course = Course.objects.create(
            title='Test Course', teacher=self.teacher, estimated_hours=1)
        self.quiz = Quiz.objects.create(
            course=self.course, title='Test Quiz', description='A quiz for testing')
        self.question = Question.objects.create(
            quiz=self.quiz, question='1+1=', correct_answer=1, options=['1', '2'])

    def test_create_quiz_as_teacher(self):
        self.client.force_authenticate(user=self.teacher)# type: ignore
        data = {'course': self.course.pk, 'title': 'New Quiz',
                'description': '... A new quiz ...'}
        response = self.client.post(
            reverse('quizzes-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_quiz_as_student(self):
        self.client.force_authenticate(user=self.student)# type: ignore
        data = {'course': self.course.pk, 'title': 'New Quiz',
                'description': '... A new quiz ...'}
        response = self.client.post(
            reverse('quizzes-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_submit_quiz(self):
        self.client.force_authenticate(user=self.student)# type: ignore
        url = reverse('quizzes-submit', kwargs={'pk': self.quiz.pk})
        answers = {str(self.question.id): 1}
        response = self.client.post(url, {'answers': answers}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['score'], 100)# type: ignore


class QuestionTests(APITestCase):

    def setUp(self):
        self.teacher = User.objects.create_user(# type: ignore
            email='teacher@example.com', password='password', role='teacher')
        self.student = User.objects.create_user(# type: ignore
            email='student@example.com', password='password', role='student')
        self.course = Course.objects.create(
            title='Test Course', teacher=self.teacher, estimated_hours=1)
        self.quiz = Quiz.objects.create(course=self.course, title='Test Quiz')

    def test_create_question_as_teacher(self):
        self.client.force_authenticate(user=self.teacher)# type: ignore
        data = {
            'quiz': self.quiz.pk,
            'question': '2+2=?',
            'correct_answer': 0,
            'options': ['4', '5']
        }
        response = self.client.post(
            reverse('questions-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_question_as_student(self):
        self.client.force_authenticate(user=self.student)# type: ignore
        data = {
            'quiz': self.quiz.pk,
            'question': '2+2=?',
            'correct_answer': 0,
            'options': ['4', '5']
        }
        response = self.client.post(
            reverse('questions-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class StudentProgressTests(APITestCase):

    def setUp(self):
        self.teacher = User.objects.create_user(# type: ignore
            email='teacher@example.com', password='password', role='teacher')
        self.student = User.objects.create_user(# type: ignore
            email='student@example.com', password='password', role='student')
        self.course = Course.objects.create(
            title='Test Course', teacher=self.teacher, estimated_hours=1)
        self.chapter = Chapter.objects.create(
            course=self.course, title='Test Chapter', order=1, content='...')
        self.progress = StudentProgress.objects.create(
            student=self.student, course=self.course)

    def test_list_progress_as_student(self):
        self.client.force_authenticate(user=self.student)# type: ignore
        response = self.client.get(reverse('progress-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)# type: ignore

    def test_list_progress_as_teacher(self):
        self.client.force_authenticate(user=self.teacher)# type: ignore
        response = self.client.get(reverse('progress-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)# type: ignore

    def test_complete_chapter(self):
        self.client.force_authenticate(user=self.student)# type: ignore
        url = reverse('progress-complete-chapter',
                      kwargs={'pk': self.progress.pk})
        response = self.client.post(
            url, {'chapter_id': self.chapter.pk}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.progress.refresh_from_db()
        self.assertIn(self.chapter, self.progress.completed_chapters.all())


class TeacherAPITests(APITestCase):

    def setUp(self):
        self.teacher = User.objects.create_user(# type: ignore
            email='teacher@example.com', password='password', role='teacher')
        self.student = User.objects.create_user(# type: ignore
            email='student@example.com', password='password', role='student')
        self.course = Course.objects.create(
            title='Test Course', teacher=self.teacher, estimated_hours=1)

    def test_teacher_dashboard_access_teacher(self):
        self.client.force_authenticate(user=self.teacher)# type: ignore
        response = self.client.get(reverse('teacher_dashboard'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_teacher_dashboard_access_student(self):
        self.client.force_authenticate(user=self.student)# type: ignore
        response = self.client.get(reverse('teacher_dashboard'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_course_analytics_access_teacher(self):
        self.client.force_authenticate(user=self.teacher)# type: ignore
        response = self.client.get(
            reverse('course_analytics', kwargs={'course_id': self.course.pk}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_course_analytics_access_student(self):
        self.client.force_authenticate(user=self.student)# type: ignore
        response = self.client.get(
            reverse('course_analytics', kwargs={'course_id': self.course.pk}))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
