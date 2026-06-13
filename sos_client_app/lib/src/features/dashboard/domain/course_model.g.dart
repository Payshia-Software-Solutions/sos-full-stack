// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'course_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CourseModel _$CourseModelFromJson(Map<String, dynamic> json) => CourseModel(
  id: json['id'] as String?,
  courseName: json['course_name'] as String?,
  courseCode: json['course_code'] as String?,
  courseImg: json['course_img'] as String?,
  whatsappLink: json['whatsapp_link'] as String?,
);

Map<String, dynamic> _$CourseModelToJson(CourseModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'course_name': instance.courseName,
      'course_code': instance.courseCode,
      'course_img': instance.courseImg,
      'whatsapp_link': instance.whatsappLink,
    };
