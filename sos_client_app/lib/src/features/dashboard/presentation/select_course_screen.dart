import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'course_provider.dart';
import '../../auth/presentation/auth_provider.dart';
import '../../../core/widgets/gradient_background.dart';

class SelectCourseScreen extends ConsumerStatefulWidget {
  const SelectCourseScreen({super.key});

  @override
  ConsumerState<SelectCourseScreen> createState() => _SelectCourseScreenState();
}

class _SelectCourseScreenState extends ConsumerState<SelectCourseScreen> {
  @override
  Widget build(BuildContext context) {
    final enrollmentsAsync = ref.watch(studentEnrollmentsProvider);
    final coursesAsync = ref.watch(allCoursesProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final cardColor = Theme.of(context).colorScheme.surface;
    final textColor = Theme.of(context).colorScheme.onSurface;

    final currentSelectedCourse = ref.watch(selectedCourseProvider);

    // Loading State
    if (enrollmentsAsync.isLoading || coursesAsync.isLoading) {
      return GradientBackground(
        child: Scaffold(
          backgroundColor: Colors.transparent,
          body: const Center(child: CircularProgressIndicator()),
        ),
      );
    }

    // Error State
    if (enrollmentsAsync.hasError) {
      return GradientBackground(
        child: Scaffold(
          backgroundColor: Colors.transparent,
          body: Center(child: Text('Error: ${enrollmentsAsync.error}')),
        ),
      );
    }

    final enrollments = enrollmentsAsync.value ?? [];
    final courses = coursesAsync.value ?? [];

    // Auto-redirect logic should ideally happen in routing or a listener, 
    // but doing it here as a fallback if the router misses it.
    if (enrollments.length == 1) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(selectedCourseProvider.notifier).setSelectedCourse(enrollments[0].courseCode!);
        context.go('/dashboard');
      });
      return GradientBackground(
        child: Scaffold(backgroundColor: Colors.transparent, body: const Center(child: CircularProgressIndicator())),
      );
    }

    return GradientBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          title: Text('Select Course', style: TextStyle(color: textColor, fontWeight: FontWeight.bold)),
          centerTitle: true,
          actions: [
            IconButton(
              icon: const Icon(Icons.logout_rounded),
              tooltip: 'Logout',
              onPressed: () {
                ref.read(authProvider.notifier).logout();
                context.go('/login');
              },
            ),
          ],
        ),
        body: enrollments.isEmpty
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.inbox_rounded, size: 64, color: isDark ? Colors.grey[700] : Colors.grey[400]),
                    const SizedBox(height: 16),
                    Text(
                      'No Enrolled Courses',
                      style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: textColor),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'You do not have any active course enrollments.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: isDark ? Colors.grey[400] : Colors.grey[600]),
                    ),
                  ],
                ),
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: enrollments.length,
              itemBuilder: (context, index) {
                final enrollment = enrollments[index];
                final courseCode = enrollment.courseCode ?? 'Unknown';
                // Find matching course details
                final courseDetails = courses.cast().firstWhere(
                      (c) => c.courseCode == courseCode,
                      orElse: () => null,
                    );

                final courseName = courseDetails?.courseName ?? courseCode;

                final isSelected = courseCode == currentSelectedCourse;

                return Padding(
                  padding: const EdgeInsets.only(bottom: 12.0),
                  child: InkWell(
                    onTap: () {
                      ref.read(selectedCourseProvider.notifier).setSelectedCourse(courseCode);
                      context.go('/dashboard');
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: isSelected ? Theme.of(context).primaryColor.withOpacity(0.05) : cardColor,
                        borderRadius: BorderRadius.circular(16),
                        border: isSelected ? Border.all(color: Theme.of(context).primaryColor, width: 2) : null,
                        boxShadow: [
                          if (!isSelected)
                            BoxShadow(
                              color: Colors.black.withOpacity(isDark ? 0.2 : 0.05),
                              blurRadius: 10,
                              offset: const Offset(0, 2),
                            ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              color: Theme.of(context).primaryColor.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(
                              Icons.school_rounded,
                              color: Theme.of(context).primaryColor,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  courseName,
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                                    color: textColor,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  courseCode,
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: isDark ? Colors.grey[400] : Colors.grey[600],
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Icon(
                            isSelected ? Icons.check_circle_rounded : Icons.chevron_right_rounded, 
                            color: isSelected ? Theme.of(context).primaryColor : (isDark ? Colors.grey[600] : Colors.grey[400])
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
      ),
    );
  }
}
