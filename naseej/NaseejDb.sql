USE NASEEJ;

CREATE TABLE USERS (
    UserId INT PRIMARY KEY IDENTITY (1,1),
    FirstName NVARCHAR(50),
    LastName NVARCHAR(50),
    PhoneNumber NVARCHAR(20),
    Nationality NVARCHAR(50),
    Degree NVARCHAR(100),
    Governorate NVARCHAR(100),
    Age INT,
    JoinDate DATETIME,
    PasswordHash NVARCHAR(MAX),
    PasswordSalt NVARCHAR(MAX)
);

CREATE TABLE ContactUs (
    ContactID INT PRIMARY KEY IDENTITY(1,1), 
    Name NVARCHAR(100), 
    Email NVARCHAR(100), 
    Subject NVARCHAR(MAX), 
    Message NVARCHAR(MAX), 
    MessageReply NVARCHAR(MAX)
);

CREATE TABLE EMPLOYEES (
    EmployeeId INT PRIMARY KEY IDENTITY(1,1),
    FullName NVARCHAR(100),
    Email NVARCHAR(100) UNIQUE,
    IsAdmin BIT,
    Image NVARCHAR(MAX),
    Scope INT,
    PasswordHash NVARCHAR(MAX),
    PasswordSalt NVARCHAR(MAX)
);

CREATE TABLE SERVICES (
    ServiceId INT PRIMARY KEY IDENTITY(1,1),
    ServiceName NVARCHAR(100),
    ServiceDescription NVARCHAR(MAX),
    ServiceImage NVARCHAR(MAX),
    ServiceDate DATETIME,
    EmployeeId INT FOREIGN KEY REFERENCES EMPLOYEES(EmployeeId),
    IsAccept NVARCHAR(50) DEFAULT 'Pending' CHECK (IsAccept IN ('Accept', 'Pending'))
);

CREATE TABLE PROJECT (
    ProjectId INT PRIMARY KEY IDENTITY(1,1),
    ProjectName NVARCHAR(100),
    ProjectImage NVARCHAR(MAX),
    ProjectDescription NVARCHAR(MAX),
    EmployeeId INT FOREIGN KEY REFERENCES EMPLOYEES(EmployeeId),
    IsAccept NVARCHAR(50) DEFAULT 'Pending' CHECK (IsAccept IN ('Accept', 'Pending'))
);

CREATE TABLE REQUEST (
    RequestId INT PRIMARY KEY IDENTITY(1,1),
    UserId INT FOREIGN KEY REFERENCES USERS(UserId),
    ServiceId INT FOREIGN KEY REFERENCES SERVICES(ServiceId),
    RequestDate DATETIME
);

CREATE TABLE Testimonials (
    id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT FOREIGN KEY REFERENCES USERS(UserId),
    Firstname NVARCHAR(255),
    Lastname NVARCHAR(255),
    theTestimonials NVARCHAR(MAX),
    isaccepted BIT DEFAULT 0,
    Email NVARCHAR(100)
);
