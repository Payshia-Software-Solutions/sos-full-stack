import 'package:json_annotation/json_annotation.dart';

part 'student_enrollment_model.g.dart';

@JsonSerializable()
class StudentEnrollmentModel {
  @JsonKey(name: 'student_course_id')
  final String? studentCourseId;
  @JsonKey(name: 'student_id')
  final String? studentId;
  @JsonKey(name: 'course_code')
  final String? courseCode;

  StudentEnrollmentModel({
    this.studentCourseId,
    this.studentId,
    this.courseCode,
  });

  factory StudentEnrollmentModel.fromJson(Map<String, dynamic> json) =>
      _$StudentEnrollmentModelFromJson(json);

  Map<String, dynamic> toJson() => _$StudentEnrollmentModelToJson(this);
}
