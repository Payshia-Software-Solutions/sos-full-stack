// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'student_enrollment_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StudentEnrollmentModel _$StudentEnrollmentModelFromJson(
  Map<String, dynamic> json,
) => StudentEnrollmentModel(
  studentCourseId: json['student_course_id'] as String?,
  studentId: json['student_id'] as String?,
  courseCode: json['course_code'] as String?,
);

Map<String, dynamic> _$StudentEnrollmentModelToJson(
  StudentEnrollmentModel instance,
) => <String, dynamic>{
  'student_course_id': instance.studentCourseId,
  'student_id': instance.studentId,
  'course_code': instance.courseCode,
};
