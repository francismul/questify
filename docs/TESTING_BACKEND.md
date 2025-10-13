# Backend API Testing Guide

This document provides an overview of how the backend API tests are structured and how to run them.

## Running the Tests

To run the tests, you need to have the virtual environment set up and the dependencies installed. From the root of the project, run the following command:

```bash
/media/the-3000/Hacker/Projects/questify/.venv/bin/python backend/manage.py test
```

This command will discover and run all the tests in the `backend/api/tests.py` file.

## Test Structure

The tests are located in `backend/api/tests.py` and use Django's `APITestCase`. The tests are organized into classes, with each class focusing on a specific part of the API.

-   `AuthTests`: Tests the authentication-related endpoints (`/auth/register`, `/auth/login`, `/auth/logout`, `/auth/user`).
-   `CourseTests`: Tests the `CourseViewSet` (`/courses`).
-   `ChapterTests`: Tests the `ChapterViewSet` (`/chapters`).
-   `QuizTests`: Tests the `QuizViewSet` (`/quizzes`).
-   `QuestionTests`: Tests the `QuestionViewSet` (`/questions`).
-   `StudentProgressTests`: Tests the `StudentProgressViewSet` (`/progress`).
-   `TeacherAPITests`: Tests the teacher-specific API endpoints (`/teacher/dashboard`, `/teacher/analytics`).

Each test class has a `setUp` method that creates the necessary objects (users, courses, etc.) for the tests.

## Test Coverage

The tests cover the following functionality:

-   **Authentication**: User registration, login, logout, and retrieving user information.
-   **Courses**: Listing, retrieving, creating, updating, and deleting courses. It also tests enrolling in a course and rating a course.
-   **Chapters**: Listing, retrieving, creating, updating, and deleting chapters.
-   **Quizzes**: Listing, retrieving, creating, updating, and deleting quizzes. It also tests submitting a quiz.
-   **Questions**: Listing, retrieving, creating, updating, and deleting questions.
-   **Student Progress**: Listing and retrieving student progress, and marking a chapter as complete.
-   **Teacher APIs**: Access to the teacher dashboard and course analytics.

## Custom Permissions

A custom permission class `IsTeacherOrReadOnly` is used to restrict write access (POST, PUT, PATCH, DELETE) to teachers only for the `CourseViewSet`, `ChapterViewSet`, `QuizViewSet`, and `QuestionViewSet`. This is tested by attempting to create and modify objects as both a teacher and a student, and asserting that the student receives a `403 Forbidden` error.
