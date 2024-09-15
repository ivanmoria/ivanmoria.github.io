<?php
// Conectar ao banco de dados
$servername = "localhost";
$username = "username";
$password = "password";
$dbname = "visitas_db";

// Substitua pelo seu token da API do ipinfo.io
$ipinfo_token = 'af497e3d9001be';

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Conexão falhou: " . $conn->connect_error);
}

// Obter o IP do visitante
$ip = $_SERVER['REMOTE_ADDR'];

// Usar a API do ipinfo.io para obter a localização
$location_data = file_get_contents("https://ipinfo.io/{$ip}?token={$ipinfo_token}");
$location = json_decode($location_data, true);
$cidade = $location['city'] ?? 'Desconhecido';
$pais = $location['country'] ?? 'Desconhecido';

// Armazenar o IP e a localidade no banco de dados
$sql = "INSERT INTO visitas (ip, cidade, pais) VALUES ('$ip', '$cidade', '$pais')";
if ($conn->query($sql) === TRUE) {
    // Contar o total de visitas
    $resultado = $conn->query("SELECT COUNT(*) AS total_visitas FROM visitas");
    $row = $resultado->fetch_assoc();
    
    // Retornar a resposta como JSON
    echo json_encode(['visitas' => $row['total_visitas'], 'cidade' => $cidade, 'pais' => $pais]);
} else {
    echo "Erro: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>
