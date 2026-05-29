import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/presentation/auth_provider.dart';
import '../../../core/theme/theme_provider.dart';

import '../../../core/theme/app_theme.dart';

class MoreScreen extends ConsumerWidget {
  const MoreScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userAsync = ref.watch(authProvider);
    final themeMode = ref.watch(themeModeProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final bgColor = Theme.of(context).scaffoldBackgroundColor;
    final cardColor = Theme.of(context).colorScheme.surface;
    final dividerColor = isDark ? AppColors.borderDark : AppColors.borderLight;
    final textColor = Theme.of(context).colorScheme.onSurface;
    final mutedColor = isDark ? AppColors.mutedDark : AppColors.mutedLight;
    final chevronColor = isDark ? AppColors.mutedDark : AppColors.mutedLight;

    return userAsync.when(
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (e, _) => Scaffold(body: Center(child: Text('Error: $e'))),
      data: (user) => Scaffold(
        backgroundColor: bgColor,
        appBar: AppBar(
          backgroundColor: bgColor,
          elevation: 0,
          surfaceTintColor: Colors.transparent,
          title: Text(
            'More',
            style: TextStyle(
              fontWeight: FontWeight.w700,
              color: textColor,
              fontSize: 22,
            ),
          ),
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 120),
          child: Column(
            children: [
              // ── User Profile Card ─────────────────────────
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFF0D4F43), Color(0xFF128C7E)],
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF128C7E).withOpacity(0.4),
                      blurRadius: 20,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: Colors.white.withOpacity(0.4),
                          width: 2,
                        ),
                      ),
                      child: Center(
                        child: Text(
                          user?.name.isNotEmpty == true
                              ? user!.name[0].toUpperCase()
                              : '?',
                          style: const TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user?.name ?? 'Student',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            user?.email ?? '',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.75),
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 3),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              user?.role == 'student' ? '🎓 Student' : '👨‍💼 Staff',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // ── Appearance ────────────────────────────────
              _SectionHeader(title: 'Appearance', mutedColor: mutedColor),
              _SectionCard(
                isDark: isDark,
                cardColor: cardColor,
                dividerColor: dividerColor,
                children: [
                  SwitchListTile(
                    contentPadding:
                        const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
                    secondary: Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: const Color(0xFF6366F1).withOpacity(0.12),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.dark_mode_rounded,
                          color: Color(0xFF6366F1), size: 20),
                    ),
                    title: Text('Dark Mode',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w500,
                          color: textColor,
                        )),
                    value: themeMode == ThemeMode.dark,
                    activeColor: const Color(0xFF128C7E),
                    onChanged: (_) =>
                        ref.read(themeModeProvider.notifier).toggle(),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // ── Account ───────────────────────────────────
              _SectionHeader(title: 'Account', mutedColor: mutedColor),
              _SectionCard(
                isDark: isDark,
                cardColor: cardColor,
                dividerColor: dividerColor,
                children: [
                  _MenuTile(
                    icon: Icons.person_outline_rounded,
                    iconColor: const Color(0xFF128C7E),
                    label: 'My Profile',
                    textColor: textColor,
                    chevronColor: chevronColor,
                    onTap: () {},
                  ),
                  Divider(height: 1, indent: 70, color: dividerColor),
                  _MenuTile(
                    icon: Icons.notifications_outlined,
                    iconColor: const Color(0xFF6366F1),
                    label: 'Notifications',
                    textColor: textColor,
                    chevronColor: chevronColor,
                    onTap: () {},
                  ),
                  Divider(height: 1, indent: 70, color: dividerColor),
                  _MenuTile(
                    icon: Icons.security_outlined,
                    iconColor: const Color(0xFFF59E0B),
                    label: 'Change Password',
                    textColor: textColor,
                    chevronColor: chevronColor,
                    onTap: () {},
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // ── Support ───────────────────────────────────
              _SectionHeader(title: 'Support', mutedColor: mutedColor),
              _SectionCard(
                isDark: isDark,
                cardColor: cardColor,
                dividerColor: dividerColor,
                children: [
                  _MenuTile(
                    icon: Icons.help_outline_rounded,
                    iconColor: const Color(0xFF3B82F6),
                    label: 'Help & FAQ',
                    textColor: textColor,
                    chevronColor: chevronColor,
                    onTap: () {},
                  ),
                  Divider(height: 1, indent: 70, color: dividerColor),
                  _MenuTile(
                    icon: Icons.info_outline_rounded,
                    iconColor: const Color(0xFF8B5CF6),
                    label: 'About',
                    textColor: textColor,
                    chevronColor: chevronColor,
                    onTap: () {},
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // ── Sign Out ──────────────────────────────────
              GestureDetector(
                onTap: () async {
                  final confirm = await showDialog<bool>(
                    context: context,
                    builder: (ctx) => AlertDialog(
                      backgroundColor: cardColor,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16)),
                      title: Text('Sign Out',
                          style: TextStyle(
                              fontWeight: FontWeight.w700, color: textColor)),
                      content: Text(
                          'Are you sure you want to sign out?',
                          style: TextStyle(color: mutedColor)),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(ctx, false),
                          child: const Text('Cancel'),
                        ),
                        ElevatedButton(
                          onPressed: () => Navigator.pop(ctx, true),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFE53935),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10)),
                          ),
                          child: const Text('Sign Out',
                              style: TextStyle(color: Colors.white)),
                        ),
                      ],
                    ),
                  );
                  if (confirm == true) {
                    ref.read(authProvider.notifier).logout();
                  }
                },
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE53935).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                        color: const Color(0xFFE53935).withOpacity(0.3)),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.logout_rounded,
                          color: Color(0xFFE53935), size: 22),
                      SizedBox(width: 14),
                      Text(
                        'Sign Out',
                        style: TextStyle(
                          color: Color(0xFFE53935),
                          fontWeight: FontWeight.w600,
                          fontSize: 15,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Reusable Widgets ─────────────────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  final String title;
  final Color mutedColor;
  const _SectionHeader({required this.title, required this.mutedColor});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 10),
      child: Align(
        alignment: Alignment.centerLeft,
        child: Text(
          title.toUpperCase(),
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            letterSpacing: 1.3,
            color: mutedColor,
          ),
        ),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final bool isDark;
  final Color cardColor;
  final Color dividerColor;
  final List<Widget> children;

  const _SectionCard({
    required this.isDark,
    required this.cardColor,
    required this.dividerColor,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.25 : 0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(children: children),
    );
  }
}

class _MenuTile extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String label;
  final Color textColor;
  final Color chevronColor;
  final VoidCallback onTap;

  const _MenuTile({
    required this.icon,
    required this.iconColor,
    required this.label,
    required this.textColor,
    required this.chevronColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
      leading: Container(
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          color: iconColor.withOpacity(0.12),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: iconColor, size: 20),
      ),
      title: Text(
        label,
        style: TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w500,
          color: textColor,
        ),
      ),
      trailing: Icon(Icons.chevron_right_rounded, color: chevronColor, size: 20),
    );
  }
}
