import 'package:json_annotation/json_annotation.dart';

part 'user_model.g.dart';

@JsonSerializable()
class UserModel {
  final String id;
  final String? username;
  final String name;
  final String email;
  final String role; // 'student' | 'staff'
  final String avatar;

  UserModel({
    required this.id,
    this.username,
    required this.name,
    required this.email,
    required this.role,
    required this.avatar,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => _$UserModelFromJson(json);
  Map<String, dynamic> toJson() => _$UserModelToJson(this);
}
