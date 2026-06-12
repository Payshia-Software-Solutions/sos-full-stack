import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:pod_player/pod_player.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'course_provider.dart';
import '../domain/recording_model.dart';
import '../../../core/widgets/gradient_background.dart';

class VideoPlayerScreen extends ConsumerStatefulWidget {
  final String videoUrl;
  final String title;
  final String description;

  const VideoPlayerScreen({
    super.key,
    required this.videoUrl,
    required this.title,
    required this.description,
  });

  @override
  ConsumerState<VideoPlayerScreen> createState() => _VideoPlayerScreenState();
}

class _VideoPlayerScreenState extends ConsumerState<VideoPlayerScreen> {
  late PodPlayerController _controller;

  @override
  void initState() {
    super.initState();
    
    // Extract the video ID from the URL to ensure pod_player parses it correctly
    String videoId = '';
    final RegExp videoIdRegex = RegExp(r'(?:embed\/|v=)([a-zA-Z0-9_-]+)');
    final match = videoIdRegex.firstMatch(widget.videoUrl);
    if (match != null && match.groupCount >= 1) {
      videoId = match.group(1)!;
    }
    if (videoId.isEmpty && !widget.videoUrl.contains('http')) {
      videoId = widget.videoUrl;
    }
    
    final cleanUrl = videoId.isNotEmpty ? 'https://youtu.be/$videoId' : widget.videoUrl;

    _controller = PodPlayerController(
      playVideoFrom: PlayVideoFrom.youtube(cleanUrl),
      podPlayerConfig: const PodPlayerConfig(
        autoPlay: true,
        isLooping: false,
      ),
    )..initialise();
  }

  @override
  void dispose() {
    _controller.dispose();
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
    ]);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = Theme.of(context).colorScheme.onSurface;
    
    return GradientBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          leading: IconButton(
            icon: Icon(Icons.arrow_back_ios_new_rounded, color: textColor),
            onPressed: () => Navigator.of(context).pop(),
          ),
          title: Text(
            widget.title,
            style: TextStyle(
              color: textColor,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // The embedded player
            AspectRatio(
              aspectRatio: 16 / 9,
              child: PodVideoPlayer(
                controller: _controller,
              ),
            ),
            
            // Video Details section
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.title,
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: textColor,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Divider(),
                    const SizedBox(height: 8),
                    Text(
                      'Course Content',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.grey[300] : Colors.grey[800],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      widget.description.replaceAll(RegExp(r'<[^>]*>|&[^;]+;'), ' ').trim(),
                      style: TextStyle(
                        fontSize: 14,
                        color: isDark ? Colors.grey[400] : Colors.grey[700],
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 24),
                    // Fallback / Open in App button
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: () async {
                          String videoId = '';
                          final RegExp videoIdRegex = RegExp(r'(?:embed\/|v=)([a-zA-Z0-9_-]+)');
                          final match = videoIdRegex.firstMatch(widget.videoUrl);
                          if (match != null && match.groupCount >= 1) {
                            videoId = match.group(1)!;
                          }
                          
                          final url = videoId.isNotEmpty 
                              ? 'https://www.youtube.com/watch?v=$videoId'
                              : widget.videoUrl;
                              
                          final uri = Uri.parse(url);
                          try {
                            final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
                            if (!launched && context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Could not open YouTube link')),
                              );
                            }
                          } catch (e) {
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Error launching YouTube: $e')),
                              );
                            }
                          }
                        },
                        icon: const Icon(Icons.smart_display, size: 24, color: Colors.red),
                        label: const Text(
                          'Open in YouTube App',
                          style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
                        ),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          side: const BorderSide(color: Colors.red),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),
                    Text(
                      'Related Videos',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: textColor,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildRelatedVideosList(isDark),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    ),   // closes Scaffold
  );     // closes GradientBackground
  }

  Widget _buildRelatedVideosList(bool isDark) {
    final selectedCourseCode = ref.watch(selectedCourseProvider);
    if (selectedCourseCode == null) return const SizedBox.shrink();

    final recordingsAsyncValue = ref.watch(courseRecordingsProvider(selectedCourseCode));

    return recordingsAsyncValue.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, stack) => const Center(child: Text('Error loading related videos', style: TextStyle(color: Colors.red))),
      data: (List<RecordingModel> recordings) {
        // Filter out the currently playing video
        final relatedRecordings = recordings.where((rec) => rec.youtubeUrl != widget.videoUrl && rec.youtubeUrl != null).toList();

        if (relatedRecordings.isEmpty) {
          return Center(
            child: Text(
              'No other videos available.',
              style: TextStyle(color: isDark ? Colors.grey[400] : Colors.grey[600]),
            ),
          );
        }

        return ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: relatedRecordings.length,
          itemBuilder: (context, index) {
            final rec = relatedRecordings[index];
            return ListTile(
              contentPadding: const EdgeInsets.symmetric(vertical: 8),
              leading: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(
                  rec.thumbnailUrl ?? '',
                  width: 120,
                  height: 68,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(
                    width: 120,
                    height: 68,
                    color: Colors.grey[800],
                    child: const Icon(Icons.video_file, color: Colors.grey),
                  ),
                ),
              ),
              title: Text(
                rec.titleName,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              subtitle: Padding(
                padding: const EdgeInsets.only(top: 4.0),
                child: Text(
                  rec.resourceType,
                  style: TextStyle(fontSize: 12, color: isDark ? Colors.grey[400] : Colors.grey[600]),
                ),
              ),
              onTap: () {
                // Replace the current route to play the new video
                context.pushReplacement(
                  '/video-player',
                  extra: {
                    'url': rec.youtubeUrl,
                    'title': rec.titleName,
                    'description': rec.description,
                  },
                );
              },
            );
          },
        );
      },
    );
  }
}
