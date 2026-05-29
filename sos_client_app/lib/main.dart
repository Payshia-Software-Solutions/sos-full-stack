import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'src/core/theme/app_theme.dart';
import 'src/core/theme/theme_provider.dart';
import 'src/features/auth/presentation/auth_provider.dart';
import 'src/features/auth/presentation/login_screen.dart';
import 'src/features/dashboard/presentation/main_scaffold.dart';
import 'src/features/dashboard/presentation/more_screen.dart';

import 'src/features/dashboard/presentation/course_provider.dart';
import 'src/features/dashboard/presentation/select_course_screen.dart';

import 'src/features/dashboard/presentation/dashboard_screen.dart';
import 'src/features/dashboard/presentation/recordings_screen.dart';

void main() {
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final themeMode = ref.watch(themeModeProvider);
    final selectedCourse = ref.watch(selectedCourseProvider);

    final router = GoRouter(
      initialLocation: '/login',
      redirect: (context, state) {
        final loggedIn = authState.value != null;
        final onLogin = state.uri.path == '/login';
        
        if (authState.isLoading) return null;
        
        // 1. Not logged in
        if (!loggedIn && !onLogin) return '/login';
        
        // 2. Logged in, going to login
        if (loggedIn && onLogin) {
          return selectedCourse != null ? '/dashboard' : '/select-course';
        }

        // 3. Logged in, going somewhere but no course selected
        if (loggedIn && selectedCourse == null && state.uri.path != '/select-course') {
          return '/select-course';
        }

        return null;
      },
      routes: [
        GoRoute(
          path: '/login',
          builder: (_, __) => const LoginScreen(),
        ),
        GoRoute(
          path: '/select-course',
          builder: (_, __) => const SelectCourseScreen(),
        ),
        ShellRoute(
          builder: (_, __, child) => MainScaffold(child: child),
          routes: [
            GoRoute(
              path: '/dashboard',
              builder: (_, __) => const DashboardScreen(),
            ),
            GoRoute(
              path: '/games',
              builder: (_, __) => const _PlaceholderScreen(
                  title: 'Games', icon: Icons.sports_esports_rounded),
            ),
            GoRoute(
              path: '/recordings',
              builder: (_, __) => const RecordingsScreen(),
            ),
            GoRoute(
              path: '/tickets',
              builder: (_, __) => const _PlaceholderScreen(
                  title: 'Support Tickets',
                  icon: Icons.confirmation_num_rounded),
            ),
            GoRoute(
              path: '/more',
              builder: (_, __) => const MoreScreen(),
            ),
          ],
        ),
      ],
    );

    return MaterialApp.router(
      title: 'SOS App',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeMode,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}

class _PlaceholderScreen extends StatelessWidget {
  final String title;
  final IconData icon;
  const _PlaceholderScreen({required this.title, required this.icon});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 88,
              height: 88,
              decoration: BoxDecoration(
                color: isDark
                    ? Colors.white.withOpacity(0.06)
                    : Colors.grey.withOpacity(0.08),
                shape: BoxShape.circle,
              ),
              child: Icon(icon,
                  size: 44,
                  color: isDark ? Colors.grey[600] : Colors.grey[400]),
            ),
            const SizedBox(height: 20),
            Text(title,
                style:
                    const TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            Text('Coming soon!',
                style: TextStyle(
                    color: isDark ? Colors.grey[600] : Colors.grey[500])),
            const SizedBox(height: 100), // space for dock
          ],
        ),
      ),
    );
  }
}
