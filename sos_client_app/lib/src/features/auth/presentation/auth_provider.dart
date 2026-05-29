import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/network/dio_client.dart';
import '../data/auth_repository.dart';
import '../domain/user_model.dart';

final dioClientProvider = Provider<DioClient>((ref) {
  return DioClient();
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(ref.watch(dioClientProvider));
});

class AuthNotifier extends AsyncNotifier<UserModel?> {
  late AuthRepository _repository;

  @override
  Future<UserModel?> build() async {
    _repository = ref.watch(authRepositoryProvider);
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    
    if (token != null) {
      final userJson = prefs.getString('user_data');
      if (userJson != null) {
        try {
          return UserModel.fromJson(jsonDecode(userJson));
        } catch (e) {
          // Fallback if parsing fails
        }
      }
      return UserModel(
        id: '1', 
        name: 'Student', 
        email: 'student@example.com', 
        role: 'student', 
        avatar: ''
      );
    }
    return null;
  }

  Future<void> login(String username, String password) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      return await _repository.login(username, password);
    });
  }

  Future<void> logout() async {
    await _repository.logout();
    state = const AsyncData(null);
  }
}

final authProvider = AsyncNotifierProvider<AuthNotifier, UserModel?>(() {
  return AuthNotifier();
});
