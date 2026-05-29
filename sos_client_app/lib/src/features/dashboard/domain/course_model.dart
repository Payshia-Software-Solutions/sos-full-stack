import 'package:json_annotation/json_annotation.dart';

part 'course_model.g.dart';

@JsonSerializable()
class CourseModel {
  final String? id;
  @JsonKey(name: 'course_name')
  final String? courseName;
  @JsonKey(name: 'course_code')
  final String? courseCode;
  @JsonKey(name: 'course_img')
  final String? courseImg;

  CourseModel({
    this.id,
    this.courseName,
    this.courseCode,
    this.courseImg,
  });

  factory CourseModel.fromJson(Map<String, dynamic> json) =>
      _$CourseModelFromJson(json);

  Map<String, dynamic> toJson() => _$CourseModelToJson(this);
}
