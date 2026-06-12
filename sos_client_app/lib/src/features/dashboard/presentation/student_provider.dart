import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/presentation/auth_provider.dart';

final studentFullInfoProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final user = ref.watch(authProvider).value;
  if (user == null || user.username == null || user.username!.isEmpty) {
    throw Exception('No logged in user');
  }
  
  final dio = ref.watch(dioClientProvider).mainDio;
  final response = await dio.get('/get-student-full-info/', queryParameters: {
    'loggedUser': user.username,
  });
  
  if (response.statusCode == 200) {
    return response.data as Map<String, dynamic>;
  } else {
    throw Exception('Failed to load student details');
  }
});
