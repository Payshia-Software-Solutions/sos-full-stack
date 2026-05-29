import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class MainScaffold extends ConsumerStatefulWidget {
  final Widget child;
  const MainScaffold({super.key, required this.child});

  @override
  ConsumerState<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends ConsumerState<MainScaffold> {
  int _calculateSelectedIndex(BuildContext context) {
    final String path = GoRouterState.of(context).uri.path;
    if (path.startsWith('/games')) return 1;
    if (path.startsWith('/tickets')) return 2;
    if (path.startsWith('/more')) return 3;
    return 0;
  }

  void _onItemTapped(int index, BuildContext context) {
    HapticFeedback.selectionClick();
    switch (index) {
      case 0:
        context.go('/dashboard');
        break;
      case 1:
        context.go('/games');
        break;
      case 2:
        context.go('/tickets');
        break;
      case 3:
        context.go('/more');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentIndex = _calculateSelectedIndex(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    // WhatsApp exact style colors
    final bgColor = isDark ? const Color(0xFF111B21) : Colors.white;
    final indicatorColor = isDark ? const Color(0xFF00A884).withOpacity(0.2) : const Color(0xFF008069).withOpacity(0.15);
    final activeIconColor = isDark ? const Color(0xFF00A884) : const Color(0xFF008069);
    final inactiveIconColor = isDark ? const Color(0xFF8696A0) : const Color(0xFF667781);

    return Scaffold(
      body: widget.child,
      bottomNavigationBar: NavigationBarTheme(
        data: NavigationBarThemeData(
          indicatorColor: indicatorColor,
          labelTextStyle: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.selected)) {
              return TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: activeIconColor,
              );
            }
            return TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: inactiveIconColor,
            );
          }),
          iconTheme: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.selected)) {
              return IconThemeData(color: activeIconColor, size: 26);
            }
            return IconThemeData(color: inactiveIconColor, size: 24);
          }),
        ),
        child: NavigationBar(
          selectedIndex: currentIndex,
          onDestinationSelected: (i) => _onItemTapped(i, context),
          backgroundColor: bgColor,
          elevation: isDark ? 0 : 8,
          shadowColor: Colors.black.withOpacity(0.2),
          surfaceTintColor: Colors.transparent,
          labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.grid_view_outlined),
              selectedIcon: Icon(Icons.grid_view_rounded),
              label: 'Dashboard',
            ),
            NavigationDestination(
              icon: Icon(Icons.sports_esports_outlined),
              selectedIcon: Icon(Icons.sports_esports_rounded),
              label: 'Games',
            ),
            NavigationDestination(
              icon: Icon(Icons.confirmation_num_outlined),
              selectedIcon: Icon(Icons.confirmation_num_rounded),
              label: 'Tickets',
            ),
            NavigationDestination(
              icon: Icon(Icons.more_horiz_outlined),
              selectedIcon: Icon(Icons.more_horiz_rounded),
              label: 'More',
            ),
          ],
        ),
      ),
    );
  }
}
