<?php

class Company
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllCompanies()
    {
        $stmt = $this->pdo->query("SELECT * FROM company");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCompanyById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM company WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createCompany($data)
    {
        $sql = "INSERT INTO company (company_name, company_address, company_address2, company_city, company_postalcode, company_email, company_telephone, company_telephone2, owner_name, job_position) 
                VALUES (:company_name, :company_address, :company_address2, :company_city, :company_postalcode, :company_email, :company_telephone, :company_telephone2, :owner_name, :job_position)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function updateCompany($id, $data)
    {
        $data['id'] = $id;
        $sql = "UPDATE company SET 
                    company_name = :company_name, 
                    company_address = :company_address, 
                    company_address2 = :company_address2, 
                    company_city = :company_city, 
                    company_postalcode = :company_postalcode, 
                    company_email = :company_email, 
                    company_telephone = :company_telephone, 
                    company_telephone2 = :company_telephone2, 
                    owner_name = :owner_name, 
                    job_position = :job_position
                WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($data);
    }

    public function deleteCompany($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM company WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }
}
