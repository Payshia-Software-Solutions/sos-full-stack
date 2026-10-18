<?php
require_once __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();
require_once __DIR__ . '/../config/database.php';

$pdo = $GLOBALS['pdo'];

// 1. Pending KYC
$stmt = $pdo->query("SELECT COUNT(*) as cnt FROM student_document_verifications WHERE status = 'pending'");
$pendingKyc = (int)$stmt->fetchColumn();

// 2. Pending Payment Requests
$stmt = $pdo->query("SELECT COUNT(*) as cnt FROM payment_requests WHERE LOWER(payment_status) = 'pending'");
$pendingPayments = (int)$stmt->fetchColumn();

// 3. Open Support Tickets
$stmt = $pdo->query("SELECT COUNT(*) as cnt FROM tickets WHERE status = 'Open'");
$openTickets = (int)$stmt->fetchColumn();

// 4. In Progress Support Tickets
$stmt = $pdo->query("SELECT COUNT(*) as cnt FROM tickets WHERE status = 'In Progress'");
$inProgressTickets = (int)$stmt->fetchColumn();

// 5. Active Chats
$stmt = $pdo->query("SELECT COUNT(*) as cnt FROM chats");
$activeChats = (int)$stmt->fetchColumn();

// 6. Active Convocation details
$stmt = $pdo->query("SELECT id, convocation_name, held_on, accept_booking FROM convocations ORDER BY accept_booking DESC, id DESC LIMIT 1");
$activeConvocation = $stmt->fetch(PDO::FETCH_ASSOC);

$convocationStats = null;
if ($activeConvocation) {
    $cId = $activeConvocation['id'];
    $stmt = $pdo->prepare("
        SELECT 
            COUNT(*) as total_bookings,
            SUM(CASE WHEN LOWER(registration_status) = 'approved' OR LOWER(payment_status) = 'approved' THEN 1 ELSE 0 END) as approved_bookings,
            SUM(CASE WHEN LOWER(payment_status) = 'pending' THEN 1 ELSE 0 END) as pending_slips,
            COALESCE(SUM(CAST(payment_amount AS DECIMAL(10,2))), 0) as total_payments
        FROM convocation_registrations 
        WHERE convocation_id = :cid
    ");
    $stmt->execute(['cid' => $cId]);
    $convData = $stmt->fetch(PDO::FETCH_ASSOC);
    $convocationStats = array_merge($activeConvocation, [
        'total_bookings' => (int)$convData['total_bookings'],
        'approved_bookings' => (int)$convData['approved_bookings'],
        'pending_slips' => (int)$convData['pending_slips'],
        'total_payments' => (float)$convData['total_payments'],
    ]);
}

$output = [
    'pending_kyc' => $pendingKyc,
    'pending_payments' => $pendingPayments,
    'open_tickets' => $openTickets,
    'in_progress_tickets' => $inProgressTickets,
    'active_chats' => $activeChats,
    'convocation' => $convocationStats,
];

header('Content-Type: application/json');
echo json_encode($output, JSON_PRETTY_PRINT);
