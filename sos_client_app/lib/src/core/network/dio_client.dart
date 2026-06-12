import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class DioClient {
  static const String mainBaseUrl = 'https://qa-api.pharmacollege.lk/';
  static const String chatBaseUrl = 'https://chat-server.pharmacollege.lk/api';
  
  final Dio _mainDio;
  final Dio _chatDio;

  DioClient() 
    : _mainDio = Dio(BaseOptions(baseUrl: mainBaseUrl)),
      _chatDio = Dio(BaseOptions(baseUrl: chatBaseUrl)) {
    
    // Interceptor for the main API
    _mainDio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final prefs = await SharedPreferences.getInstance();
          final token = prefs.getString('auth_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
      ),
    );

    // Interceptor for the chat server API
    _chatDio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final prefs = await SharedPreferences.getInstance();
          final token = prefs.getString('auth_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
      ),
    );
  }

  Dio get mainDio => _mainDio;
  Dio get chatDio => _chatDio;
}
