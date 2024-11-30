using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.Scripting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;
using Naseej_Project.DTOs;
using Naseej_Project.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Naseej_Project.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class loginController : ControllerBase
    {

        private readonly MyDbContext _db;
        private readonly IConfiguration _configuration;

        public loginController(MyDbContext db, IConfiguration configuration)
        {
            _db = db;
            _configuration = configuration;

        }


        /// <summary>
        /// Register a new user
        /// </summary>
        /// <param name="registerDto"></param>
        /// <returns></returns>
        [HttpPost("Register")]
        public IActionResult Register([FromBody] LoginDTO registerDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Model state is not valid.");
            }

            if (string.IsNullOrEmpty(registerDto.PasswordHash))
            {
                return BadRequest("Password is required.");
            }

            var existingUserByPhone = _db.Users.FirstOrDefault(u => u.PhoneNumber == registerDto.PhoneNumber);
            if (existingUserByPhone != null)
            {
                return Conflict(new { message = "Phone number is already used. Please use another one." });
            }

            var existingUserByEmail = _db.Users.FirstOrDefault(u => u.Email == registerDto.Email);
            if (existingUserByEmail != null)
            {
                return Conflict(new { message = "Email is already used. Please use another one." });
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.PasswordHash);

            var newUser = new User
            {
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                PhoneNumber = registerDto.PhoneNumber,
                Email = registerDto.Email,
                Nationality = registerDto.Nationality,
                Degree = registerDto.Degree,
                Governorate = registerDto.Governorate,
                Age = registerDto.Age,
                JoinDate = DateTime.Now,
                PasswordHash = passwordHash,
                PasswordSalt = registerDto.PasswordSalt,
            };

            _db.Users.Add(newUser);
            _db.SaveChanges();

            return CreatedAtAction(nameof(Register), new { id = newUser.UserId }, new
            {
                FirstName = newUser.FirstName,
                LastName = newUser.LastName,
                PhoneNumber = newUser.PhoneNumber,
                Email = newUser.Email,
                Message = "User registered successfully."
            });
        }







        /// <summary>
        /// Login an existing user
        /// </summary>
        /// <param name="loginDto"></param>
        /// <returns></returns>
        [HttpPost("Login")]
        public IActionResult Login([FromBody] LoginDTO loginDto)
        {
            if (string.IsNullOrEmpty(loginDto.Email) || string.IsNullOrEmpty(loginDto.PasswordHash))
            {
                return BadRequest(new { message = "Email Address and password are required." });
            }

            var user = _db.Users.FirstOrDefault(u => u.Email == loginDto.Email);
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid Email Address or password." });
            }

            if (!BCrypt.Net.BCrypt.Verify(loginDto.PasswordHash, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid Email Address or password." });
            }

            
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.GivenName, user.FirstName ?? ""),
                new Claim(ClaimTypes.Surname, user.LastName ?? "")
            };

            
            var token = GenerateJwtToken(claims);

            
            return Ok(new
            {
                Message = "Login successful",
                Token = token,
                UserId = user.UserId,
                FirstName = user.FirstName
            });
        }

        private string GenerateJwtToken(Claim[] claims)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(6),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [Authorize]
        [HttpGet("protected-endpoint")]
        public IActionResult ProtectedEndpoint()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Ok(new { UserId = userId, Message = "You accessed a protected endpoint" });
        }
    }
}

