import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'student_provider.dart';
import '../../../core/theme/app_theme.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final studentInfoAsync = ref.watch(studentFullInfoProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final bgColor = Theme.of(context).scaffoldBackgroundColor;
    final cardColor = Theme.of(context).colorScheme.surface;
    final textColor = Theme.of(context).colorScheme.onSurface;
    final mutedColor = isDark ? AppColors.mutedDark : AppColors.mutedLight;
    final primaryColor = Theme.of(context).primaryColor;

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: textColor),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          'My Profile',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: textColor,
            fontSize: 20,
          ),
        ),
        centerTitle: true,
      ),
      body: studentInfoAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(),
        ),
        error: (err, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline_rounded, size: 64, color: Colors.red[400]),
              const SizedBox(height: 16),
              Text(
                'Failed to load profile details',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: textColor),
              ),
              const SizedBox(height: 8),
              Text(
                err.toString(),
                style: TextStyle(color: mutedColor, fontSize: 12),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () => ref.invalidate(studentFullInfoProvider),
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Try Again'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: primaryColor,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              )
            ],
          ),
        ),
        data: (data) {
          Map<String, dynamic> student = {};
          if (data['studentInfo'] is Map) {
            student = Map<String, dynamic>.from(data['studentInfo'] as Map);
          }

          if (student.isEmpty) {
            return Center(
              child: Text(
                'No profile information found.',
                style: TextStyle(color: mutedColor),
              ),
            );
          }

          final fullName = student['full_name'] ?? student['first_name'] ?? 'Student';
          final nameOnCert = student['name_on_certificate'] ?? 'Not specified';
          final studentId = student['student_id'] ?? 'N/A';
          final email = student['e_mail'] ?? 'N/A';
          final nic = student['nic'] ?? 'N/A';
          final gender = student['gender'] ?? 'N/A';
          final bday = student['birth_day'] ?? 'N/A';
          final phone1 = student['telephone_1'] ?? 'N/A';
          final phone2 = student['telephone_2'] ?? 'N/A';
          final civilStatus = student['civil_status'] ?? 'N/A';
          
          final addressParts = [
            student['address_line_1'],
            student['address_line_2'],
            student['city'],
            student['district'],
            student['postal_code']
          ].where((part) => part != null && part.toString().trim().isNotEmpty).toList();
          
          final address = addressParts.isNotEmpty ? addressParts.join(', ') : 'N/A';

          return SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(24, 8, 24, 40),
            child: Column(
              children: [
                // Avatar and header card
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [Color(0xFF0D4F43), Color(0xFF128C7E)],
                    ),
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF128C7E).withOpacity(0.3),
                        blurRadius: 15,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 36,
                        backgroundColor: Colors.white.withOpacity(0.2),
                        child: Text(
                          fullName.isNotEmpty ? fullName[0].toUpperCase() : 'S',
                          style: const TextStyle(
                            fontSize: 32,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      const SizedBox(width: 20),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              fullName,
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Student ID: $studentId',
                              style: TextStyle(
                                fontSize: 13,
                                color: Colors.white.withOpacity(0.85),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'NIC: $nic',
                              style: TextStyle(
                                fontSize: 13,
                                color: Colors.white.withOpacity(0.85),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 28),

                // Personal Info section
                _buildInfoSection(
                  context,
                  title: 'Personal Details',
                  isDark: isDark,
                  cardColor: cardColor,
                  textColor: textColor,
                  mutedColor: mutedColor,
                  primaryColor: primaryColor,
                  items: [
                    _InfoRow(icon: Icons.person_rounded, label: 'Full Name', value: fullName),
                    _InfoRow(icon: Icons.badge_rounded, label: 'Name on Certificate', value: nameOnCert),
                    _InfoRow(icon: Icons.cake_rounded, label: 'Birthday', value: bday),
                    _InfoRow(icon: Icons.wc_rounded, label: 'Gender', value: gender),
                    _InfoRow(icon: Icons.favorite_rounded, label: 'Civil Status', value: civilStatus),
                  ],
                ),
                const SizedBox(height: 20),

                // Contact Info section
                _buildInfoSection(
                  context,
                  title: 'Contact Details',
                  isDark: isDark,
                  cardColor: cardColor,
                  textColor: textColor,
                  mutedColor: mutedColor,
                  primaryColor: primaryColor,
                  items: [
                    _InfoRow(icon: Icons.email_rounded, label: 'Email Address', value: email),
                    _InfoRow(icon: Icons.phone_android_rounded, label: 'Primary Contact', value: phone1),
                    _InfoRow(icon: Icons.phone_rounded, label: 'Alternative Contact', value: phone2),
                    _InfoRow(icon: Icons.home_rounded, label: 'Address', value: address),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildInfoSection(
    BuildContext context, {
    required String title,
    required bool isDark,
    required Color cardColor,
    required Color textColor,
    required Color mutedColor,
    required Color primaryColor,
    required List<_InfoRow> items,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 10),
          child: Text(
            title.toUpperCase(),
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.2,
              color: primaryColor,
            ),
          ),
        ),
        Container(
          width: double.infinity,
          decoration: BoxDecoration(
            color: cardColor,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(isDark ? 0.2 : 0.04),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: items.length,
            separatorBuilder: (context, index) => Divider(
              height: 1,
              color: isDark ? Colors.white.withOpacity(0.08) : Colors.grey.withOpacity(0.1),
              indent: 52,
            ),
            itemBuilder: (context, index) {
              final item = items[index];
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: primaryColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(item.icon, color: primaryColor, size: 20),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.label,
                            style: TextStyle(
                              fontSize: 12,
                              color: mutedColor,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            item.value,
                            style: TextStyle(
                              fontSize: 15,
                              color: textColor,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _InfoRow {
  final IconData icon;
  final String label;
  final String value;

  _InfoRow({required this.icon, required this.label, required this.value});
}
