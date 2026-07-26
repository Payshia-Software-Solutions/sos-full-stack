import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../auth/presentation/auth_provider.dart';
import '../data/course_repository.dart';
import '../domain/course_model.dart';
import '../domain/student_enrollment_model.dart';
import '../domain/recording_model.dart';

final courseRepositoryProvider = Provider<CourseRepository>((ref) {
  return CourseRepository(ref.watch(dioClientProvider));
});

// Fetches the global list of all courses
final allCoursesProvider = FutureProvider<List<CourseModel>>((ref) async {
  return ref.watch(courseRepositoryProvider).getCourses();
});

// Fetches enrollments for the currently logged-in user
final studentEnrollmentsProvider = FutureProvider<List<StudentEnrollmentModel>>((ref) async {
  final user = ref.watch(authProvider).value;
  if (user == null || user.username == null || user.username!.isEmpty) {
    return [];
  }
  return ref.watch(courseRepositoryProvider).getStudentEnrollments(user.username!);
});

final courseRecordingsProvider = FutureProvider.family<List<RecordingModel>, String>((ref, courseCode) async {
  final repository = ref.read(courseRepositoryProvider);
  return repository.getCourseRecordings(courseCode);
});

// Manages the globally selected course_code
class SelectedCourseNotifier extends Notifier<String?> {
  @override
  String? build() {
    return null; // Always null on app startup to force selection
  }

  Future<void> setSelectedCourse(String courseCode) async {
    state = courseCode;
  }

  Future<void> clearSelectedCourse() async {
    state = null;
  }
}

final selectedCourseProvider = NotifierProvider<SelectedCourseNotifier, String?>(() {
  return SelectedCourseNotifier();
});
