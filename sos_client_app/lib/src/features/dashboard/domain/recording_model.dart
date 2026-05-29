class RecordingModel {
  final String id;
  final String courseCode;
  final String titleName;
  final String resourceType;
  final String description; // Contains HTML and iframe
  final String? youtubeUrl;
  final String? thumbnailUrl;
  final String createdAt;

  RecordingModel({
    required this.id,
    required this.courseCode,
    required this.titleName,
    required this.resourceType,
    required this.description,
    this.youtubeUrl,
    this.thumbnailUrl,
    required this.createdAt,
  });

  factory RecordingModel.fromJson(Map<String, dynamic> json) {
    String desc = json['description'] ?? '';
    
    // Extract YouTube URL from iframe src if present
    String? extractedYoutubeUrl;
    String? extractedThumbnailUrl;
    
    final RegExp iframeRegex = RegExp(r'<iframe[^>]+src="([^">]+)"');
    final match = iframeRegex.firstMatch(desc);
    
    if (match != null && match.groupCount >= 1) {
      extractedYoutubeUrl = match.group(1);
      
      // Attempt to extract video ID and generate thumbnail
      if (extractedYoutubeUrl != null) {
        final RegExp videoIdRegex = RegExp(r'embed\/([a-zA-Z0-9_-]+)');
        final vidMatch = videoIdRegex.firstMatch(extractedYoutubeUrl);
        if (vidMatch != null && vidMatch.groupCount >= 1) {
          final videoId = vidMatch.group(1);
          extractedThumbnailUrl = 'https://img.youtube.com/vi/$videoId/hqdefault.jpg';
        }
      }
    }

    return RecordingModel(
      id: json['id']?.toString() ?? '',
      courseCode: json['course_code'] ?? '',
      titleName: json['title_name'] ?? 'Recording',
      resourceType: json['resource_type'] ?? 'Text',
      description: desc,
      youtubeUrl: extractedYoutubeUrl,
      thumbnailUrl: extractedThumbnailUrl,
      createdAt: json['created_at'] ?? '',
    );
  }
}
