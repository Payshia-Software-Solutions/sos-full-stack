import '../../../core/network/dio_client.dart';
import '../domain/course_model.dart';
import '../domain/student_enrollment_model.dart';
import '../domain/recording_model.dart';

class CourseRepository {
  final DioClient _dioClient;

  CourseRepository(this._dioClient);

  Future<List<CourseModel>> getCourses() async {
    try {
      final response = await _dioClient.mainDio.get('/course');
      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        return data.values
            .map((json) => CourseModel.fromJson(json as Map<String, dynamic>))
            .toList();
      }
      return [];
    } catch (e) {
      print('DEBUG getCourses Error: $e');
      throw Exception('Failed to fetch courses: $e');
    }
  }

  Future<List<RecordingModel>> getCourseRecordings(String courseCode) async {
    try {
      final response = await _dioClient.mainDio.get('/api/course-content-titles/course/$courseCode');
      
      if (response.statusCode == 200) {
        List<dynamic> data = response.data;
        final recordings = data.map((json) => RecordingModel.fromJson(json as Map<String, dynamic>)).toList();
        return recordings.where((r) => r.youtubeUrl != null).toList();
      }
      return [];
    } catch (e) {
      print('Error fetching recordings for $courseCode: $e');
      return [];
    }
  }

  Future<List<StudentEnrollmentModel>> getStudentEnrollments(String username) async {
    try {
      print('DEBUG fetching enrollments for $username');
      final response = await _dioClient.mainDio.get('/student-courses-new/student-number/$username');
      print('DEBUG enrollments status: ${response.statusCode}');
      
      if (response.statusCode == 200) {
        final data = response.data as List;
        print('DEBUG enrollments data length: ${data.length}');
        return data
            .map((json) => StudentEnrollmentModel.fromJson(json as Map<String, dynamic>))
            .toList();
      }
      if (response.statusCode == 404) {
        return [];
      }
      return [];
    } catch (e) {
      print('DEBUG getStudentEnrollments Error: $e');
      if (e.toString().contains('404')) {
        return [];
      }
      throw Exception('Failed to fetch student enrollments: $e');
    }
  }
}
