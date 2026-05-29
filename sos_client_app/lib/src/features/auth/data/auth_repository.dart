import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../domain/user_model.dart';
import '../../../core/network/dio_client.dart';

class AuthRepository {
  final DioClient _dioClient;

  AuthRepository(this._dioClient);

  Future<UserModel> login(String username, String password) async {
    try {
      // The Next.js client uses /users/login
      final response = await _dioClient.mainDio.post('/users/login', data: {
        'username': username,
        'password': password,
      });

      if (response.statusCode == 200) {
        final data = response.data;
        // Backend currently doesn't return a token in /users/login, 
        // but we setup token-based auth as requested, so using a dummy fallback for now.
        final token = data['token'] ?? 'dummy_token_for_now'; 
        final apiUser = data['user'];
        
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', token);

        final fname = apiUser['fname']?.toString() ?? '';
        final lname = apiUser['lname']?.toString() ?? '';
        final fnameInitial = fname.isNotEmpty ? fname.substring(0, 1) : '';
        final lnameInitial = lname.isNotEmpty ? lname.substring(0, 1) : '';

        final userModel = UserModel(
          id: apiUser['id']?.toString() ?? '',
          username: apiUser['username'],
          name: '$fname $lname'.trim(),
          email: apiUser['email'] ?? '',
          role: apiUser['userlevel'] == 'Student' ? 'student' : 'staff',
          avatar: 'https://placehold.co/100x100.png?text=$fnameInitial$lnameInitial',
        );

        // Save user JSON to prefs so we can restore it on app restart
        await prefs.setString('user_data', jsonEncode(userModel.toJson()));

        return userModel;
      } else {
        throw Exception('Failed to login');
      }
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Network Error');
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }
}
