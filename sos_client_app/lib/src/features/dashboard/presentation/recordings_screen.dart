import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'course_provider.dart';
import '../domain/recording_model.dart';

class RecordingsScreen extends ConsumerStatefulWidget {
  const RecordingsScreen({super.key});

  @override
  ConsumerState<RecordingsScreen> createState() => _RecordingsScreenState();
}

class _RecordingsScreenState extends ConsumerState<RecordingsScreen> {
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    final selectedCourseCode = ref.watch(selectedCourseProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    final bgColor = Theme.of(context).scaffoldBackgroundColor;
    final cardColor = Theme.of(context).colorScheme.surface;
    final textColor = Theme.of(context).colorScheme.onSurface;

    if (selectedCourseCode == null) {
      return Scaffold(
        backgroundColor: bgColor,
        appBar: AppBar(title: const Text('Recordings')),
        body: const Center(child: Text('No course selected')),
      );
    }

    final recordingsAsyncValue = ref.watch(courseRecordingsProvider(selectedCourseCode));

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        title: const Text('Course Content & Videos', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Search Bar
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Container(
                decoration: BoxDecoration(
                  color: cardColor,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(isDark ? 0.2 : 0.05),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: TextField(
                  onChanged: (value) => setState(() => _searchQuery = value),
                  decoration: InputDecoration(
                    hintText: 'Search recordings...',
                    prefixIcon: Icon(Icons.search_rounded, color: Theme.of(context).primaryColor),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  ),
                ),
              ),
            ),

            // Recordings Grid / List
            Expanded(
              child: recordingsAsyncValue.when(
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (err, stack) => Center(child: Text('Error: $err', style: TextStyle(color: Colors.red))),
                data: (List<RecordingModel> recordings) {
                  final filteredRecordings = recordings.where((rec) {
                    final matchesSearch = rec.titleName.toLowerCase().contains(_searchQuery.toLowerCase());
                    return matchesSearch;
                  }).toList();

                  if (filteredRecordings.isEmpty) {
                    return Center(
                      child: Text(
                        'No recordings found.',
                        style: TextStyle(color: isDark ? Colors.grey[400] : Colors.grey[600]),
                      ),
                    );
                  }

                  return ListView.builder(
                    padding: const EdgeInsets.only(top: 8, bottom: 24),
                    itemCount: filteredRecordings.length,
                    itemBuilder: (context, index) {
                      final rec = filteredRecordings[index];
                      return InkWell(
                        onTap: () {
                          if (rec.youtubeUrl != null) {
                            context.push(
                              '/video-player',
                              extra: {
                                'url': rec.youtubeUrl,
                                'title': rec.titleName,
                                'description': rec.description,
                              },
                            );
                          }
                        },
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Thumbnail Stack
                            Stack(
                              children: [
                                Image.network(
                                  rec.thumbnailUrl ?? '',
                                  height: 220,
                                  width: double.infinity,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) => Container(
                                    height: 220,
                                    width: double.infinity,
                                    color: Colors.grey[800],
                                    child: const Center(child: Icon(Icons.video_file, size: 50, color: Colors.grey)),
                                  ),
                                ),
                                // Category/Type badge
                                Positioned(
                                  bottom: 8,
                                  right: 8,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: Colors.black.withOpacity(0.8),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: const Text(
                                      'Video',
                                      style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            // Details
                            Padding(
                              padding: const EdgeInsets.fromLTRB(12, 12, 12, 24),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  CircleAvatar(
                                    radius: 20,
                                    backgroundColor: Colors.blueAccent.withOpacity(0.2),
                                    child: const Icon(Icons.play_circle_fill, color: Colors.blueAccent),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          rec.titleName,
                                          style: TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.w500,
                                            color: textColor,
                                          ),
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          '${rec.resourceType} • Course Content',
                                          style: TextStyle(
                                            fontSize: 13,
                                            color: isDark ? Colors.grey[400] : Colors.grey[600],
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ],
                                    ),
                                  ),
                                  IconButton(
                                    padding: EdgeInsets.zero,
                                    constraints: const BoxConstraints(),
                                    icon: const Icon(Icons.more_vert, size: 20),
                                    color: isDark ? Colors.grey[400] : Colors.grey[600],
                                    onPressed: () {},
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
