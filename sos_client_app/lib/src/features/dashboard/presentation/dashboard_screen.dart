import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'course_provider.dart';
import 'student_provider.dart';
import '../../auth/presentation/auth_provider.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).value;
    final selectedCourseCode = ref.watch(selectedCourseProvider);
    final enrollmentsAsync = ref.watch(studentEnrollmentsProvider);
    final coursesAsync = ref.watch(allCoursesProvider);
    final studentInfoAsync = ref.watch(studentFullInfoProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final bgColor = Theme.of(context).scaffoldBackgroundColor;
    final cardColor = Theme.of(context).colorScheme.surface;
    final textColor = Theme.of(context).colorScheme.onSurface;

    String currentCourseName = selectedCourseCode ?? 'Unknown Course';
    if (coursesAsync.hasValue && selectedCourseCode != null) {
      final courseDetails = coursesAsync.value!.cast().firstWhere(
        (c) => c.courseCode == selectedCourseCode,
        orElse: () => null,
      );
      if (courseDetails != null) {
        currentCourseName = courseDetails.courseName ?? selectedCourseCode;
      }
    }

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(studentFullInfoProvider);
            ref.invalidate(studentEnrollmentsProvider);
            ref.invalidate(allCoursesProvider);
            try {
              await ref.read(studentFullInfoProvider.future);
            } catch (_) {}
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(24.0),
            child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // --- Header ---
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Hello,',
                        style: TextStyle(
                          fontSize: 16,
                          color: isDark ? Colors.grey[400] : Colors.grey[600],
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        user?.name ?? 'Student',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: textColor,
                        ),
                      ),
                    ],
                  ),
                  CircleAvatar(
                    radius: 24,
                    backgroundImage: user?.avatar != null && user!.avatar.isNotEmpty 
                        ? NetworkImage(user.avatar) 
                        : null,
                    backgroundColor: Theme.of(context).primaryColor.withOpacity(0.1),
                    child: user?.avatar == null || user!.avatar.isEmpty
                        ? Icon(Icons.person, color: Theme.of(context).primaryColor)
                        : null,
                  ),
                ],
              ),
              
              // --- KPI Cards Section ---
              studentInfoAsync.when(
                loading: () => const Padding(
                  padding: EdgeInsets.symmetric(vertical: 20),
                  child: Center(child: CircularProgressIndicator()),
                ),
                error: (err, _) => const SizedBox.shrink(),
                data: (data) {
                  final dynamic rawBalance = data['studentBalance']?['studentBalance'];
                  final num balance = rawBalance is num 
                      ? rawBalance 
                      : (rawBalance != null ? num.tryParse(rawBalance.toString()) ?? 0 : 0);

                  // Handle studentEnrollments which could be a Map or a List depending on PHP empty array representation
                  Map<String, dynamic> enrollments = {};
                  if (data['studentEnrollments'] is Map) {
                    enrollments = Map<String, dynamic>.from(data['studentEnrollments'] as Map);
                  }

                  final courseData = selectedCourseCode != null ? enrollments[selectedCourseCode] as Map<String, dynamic>? : null;

                  final assignmentAvg = courseData?['assignment_grades']?['average_grade'] ?? '0.00';
                  
                  final dynamic rawRecovered = courseData?['ceylon_pharmacy']?['recoveredCount'];
                  final int recoveredPatients = rawRecovered is int 
                      ? rawRecovered 
                      : (rawRecovered != null ? int.tryParse(rawRecovered.toString()) ?? 0 : 0);
                  
                  final dynamic rawPhGems = courseData?['pharma_hunter']?['gemCount'];
                  final int phGems = rawPhGems is int 
                      ? rawPhGems 
                      : (rawPhGems != null ? int.tryParse(rawPhGems.toString()) ?? 0 : 0);

                  final dynamic rawPhpGems = courseData?['pharma_hunter_pro']?['results']?['gemCount'];
                  final int phpGems = rawPhpGems is int 
                      ? rawPhpGems 
                      : (rawPhpGems != null ? int.tryParse(rawPhpGems.toString()) ?? 0 : 0);

                  final int totalGems = phGems + phpGems;

                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 28),
                      Text(
                        'Your Progress',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: textColor,
                        ),
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        height: 110,
                        child: ListView(
                          scrollDirection: Axis.horizontal,
                          physics: const BouncingScrollPhysics(),
                          children: [
                            _buildKpiCard(
                              context,
                              title: 'Outstanding Balance',
                              value: 'LKR $balance',
                              subtitle: balance > 0 ? 'Payment Pending' : 'No Dues',
                              icon: Icons.account_balance_wallet_rounded,
                              color: balance > 0 ? Colors.redAccent : Colors.green,
                            ),
                            const SizedBox(width: 12),
                            _buildKpiCard(
                              context,
                              title: 'Avg Assignment Grade',
                              value: '$assignmentAvg%',
                              subtitle: 'Across assignments',
                              icon: Icons.analytics_rounded,
                              color: Colors.indigoAccent,
                            ),
                            const SizedBox(width: 12),
                            _buildKpiCard(
                              context,
                              title: 'Pharma Hunter Gems',
                              value: '$totalGems ✨',
                              subtitle: 'Gems collected',
                              icon: Icons.auto_awesome_rounded,
                              color: Colors.amber[700]!,
                            ),
                            const SizedBox(width: 12),
                            _buildKpiCard(
                              context,
                              title: 'Recovered Patients',
                              value: '$recoveredPatients',
                              subtitle: 'Ceylon Pharmacy',
                              icon: Icons.healing_rounded,
                              color: Colors.teal,
                            ),
                          ],
                        ),
                      ),
                    ],
                  );
                },
              ),

              const SizedBox(height: 32),

              // --- Course Switcher ---
              Text(
                'Current Course',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: isDark ? Colors.grey[400] : Colors.grey[600],
                ),
              ),
              const SizedBox(height: 8),
              
              Container(
                decoration: BoxDecoration(
                  color: cardColor,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(isDark ? 0.2 : 0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    borderRadius: BorderRadius.circular(16),
                    onTap: () {
                      context.push('/select-course');
                    },
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                      child: Row(
                        children: [
                          Icon(Icons.school_rounded, color: Theme.of(context).primaryColor, size: 28),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Selected Course',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: isDark ? Colors.grey[400] : Colors.grey[600],
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  currentCourseName,
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: textColor,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                                if (selectedCourseCode != null) ...[
                                  const SizedBox(height: 2),
                                  Text(
                                    selectedCourseCode,
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w500,
                                      color: isDark ? Colors.grey[400] : Colors.grey[600],
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: Theme.of(context).primaryColor.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  'Switch',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: Theme.of(context).primaryColor,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                Icon(Icons.swap_horiz_rounded, size: 16, color: Theme.of(context).primaryColor),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 32),

              // --- Quick Action Menus (Facebook Style Cards) ---
              Text(
                'Menu',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: textColor,
                ),
              ),
              const SizedBox(height: 16),
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 16,
                crossAxisSpacing: 16,
                childAspectRatio: 1.1,
                children: [
                  _buildMenuCard(
                    context,
                    title: 'Course\nRecordings',
                    icon: Icons.video_library_rounded,
                    color: Colors.blueAccent,
                    onTap: () {
                      if (selectedCourseCode != null) {
                        context.push('/recordings');
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select a course first.')));
                      }
                    },
                  ),
                  _buildMenuCard(
                    context,
                    title: 'Games &\nChallenges',
                    icon: Icons.sports_esports_rounded,
                    color: Colors.orangeAccent,
                    onTap: () {
                      // Navigate to games when implemented
                    },
                  ),
                  _buildMenuCard(
                    context,
                    title: 'Support\nTickets',
                    icon: Icons.confirmation_number_rounded,
                    color: Colors.purpleAccent,
                    onTap: () {
                      // Navigate to tickets when implemented
                    },
                  ),
                  _buildMenuCard(
                    context,
                    title: 'Convocation\nBooking',
                    icon: Icons.school_rounded,
                    color: Colors.teal,
                    onTap: () {
                      // Navigate to convocation when implemented
                    },
                  ),
                  _buildMenuCard(
                    context,
                    title: 'Order\nCertificate',
                    icon: Icons.workspace_premium_rounded,
                    color: Colors.green,
                    onTap: () {
                      // Navigate to certificate when implemented
                    },
                  ),
                  _buildMenuCard(
                    context,
                    title: 'More\nServices',
                    icon: Icons.grid_view_rounded,
                    color: Colors.grey,
                    onTap: () {
                      // Navigate to more services
                    },
                  ),
                ],
              ),
              
              const SizedBox(height: 100), // Space for dock
            ],
          ),
        ),
      ),
      ),
    );
  }

  Widget _buildMenuCard(BuildContext context, {required String title, required IconData icon, required Color color, required VoidCallback onTap}) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = Theme.of(context).colorScheme.surface;

    return Container(
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.2 : 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.15),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, color: color, size: 28),
                ),
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.onSurface,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildKpiCard(
    BuildContext context, {
    required String title,
    required String value,
    required String subtitle,
    required IconData icon,
    required Color color,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = Theme.of(context).colorScheme.surface;
    final textColor = Theme.of(context).colorScheme.onSurface;

    return Container(
      width: 175,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.2 : 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.grey[400] : Colors.grey[600],
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Icon(icon, color: color, size: 18),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: textColor,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            subtitle,
            style: TextStyle(
              fontSize: 10,
              color: isDark ? Colors.grey[500] : Colors.grey[600],
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
