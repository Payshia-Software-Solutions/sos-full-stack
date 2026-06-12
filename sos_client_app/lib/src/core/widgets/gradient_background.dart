import 'package:flutter/material.dart';

/// A wrapper widget that applies a rich gradient background in dark mode
/// and falls back to the normal scaffold background in light mode.
class GradientBackground extends StatelessWidget {
  final Widget child;
  const GradientBackground({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (!isDark) {
      return Container(
        color: Theme.of(context).scaffoldBackgroundColor,
        child: child,
      );
    }

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF0D1B2A), // Deep navy
            Color(0xFF11202F), // Dark blue-black
            Color(0xFF0A1628), // Very dark blue
            Color(0xFF111B21), // WhatsApp dark (familiar)
          ],
          stops: [0.0, 0.35, 0.7, 1.0],
        ),
      ),
      child: child,
    );
  }
}
