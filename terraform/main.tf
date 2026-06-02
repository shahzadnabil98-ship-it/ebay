terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "eu-central-1" # Frankfurt
}

# --- NETZWERK (VPC) ERSTELLEN ---

resource "aws_vpc" "restkiste_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = { Name = "restkiste-vpc" }
}

resource "aws_subnet" "restkiste_subnet" {
  vpc_id                  = aws_vpc.restkiste_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "eu-central-1a"
  tags = { Name = "restkiste-subnet" }
}

resource "aws_internet_gateway" "restkiste_igw" {
  vpc_id = aws_vpc.restkiste_vpc.id
  tags   = { Name = "restkiste-igw" }
}

resource "aws_route_table" "restkiste_rt" {
  vpc_id = aws_vpc.restkiste_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.restkiste_igw.id
  }
  tags = { Name = "restkiste-route-table" }
}

resource "aws_route_table_association" "restkiste_rta" {
  subnet_id      = aws_subnet.restkiste_subnet.id
  route_table_id = aws_route_table.restkiste_rt.id
}

# --- SSH SCHLÜSSEL ---

resource "aws_key_pair" "deployer" {
  key_name   = "restkiste-ssh-key"
  public_key = file("${path.module}/../aws_key.pub")
}

# --- IAM ROLLE FÜR ECR ZUGRIFF (NEU & WICHTIG) ---

# --- IAM ROLLE FÜR ECR ZUGRIFF (KORRIGIERT) ---

resource "aws_iam_role" "ec2_ecr_role" {
  name = "restkiste-ec2-ecr-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com" # <--- HIER WAR DER FEHLER (Muss exakt so heißen!)
        }
      }
    ]
  })
}


resource "aws_iam_role_policy_attachment" "ecr_read" {
  role       = aws_iam_role.ec2_ecr_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "restkiste-ec2-profile"
  role = aws_iam_role.ec2_ecr_role.name
}

# --- SICHERHEITSGRUPPE ---

resource "aws_security_group" "restkiste_sg" {
  name        = "restkiste-sg"
  description = "Allow SSH and Backend Traffic"
  vpc_id      = aws_vpc.restkiste_vpc.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# --- SERVER (EC2) ---

resource "aws_instance" "app_server" {
  ami                    = "ami-0f1834be8d049e69f" # KORREKTUR: Offizielles Amazon Linux 2023 AMI
  instance_type          = "t2.micro"
  subnet_id              = aws_subnet.restkiste_subnet.id
  vpc_security_group_ids = [aws_security_group.restkiste_sg.id]
  key_name               = aws_key_pair.deployer.key_name
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name # Rolle zuweisen

  # KORREKTUR: Richtige Installations-Befehle für Amazon Linux
  user_data = <<-EOF
              #!/bin/bash
              sudo yum update -y
              sudo yum install -y docker
              sudo systemctl start docker
              sudo systemctl enable docker
              sudo usermod -aG docker ec2-user
              EOF

  tags = {
    Name = "RestKiste-Backend-Server"
  }
}

output "server_public_ip" {
  value       = aws_instance.app_server.public_ip
  description = "Die öffentliche IP-Adresse Ihres neuen AWS-Servers"
}
