using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.Operations;
using Microsoft.EntityFrameworkCore;
using Naseej_Project.DTOs;
using Naseej_Project.Models;
using BCrypt.Net;
namespace Naseej_Project.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmpolyeesController : ControllerBase
    {

        private readonly MyDbContext _db;

        public EmpolyeesController(MyDbContext db)
        {
            _db = db;
        }

        // GET: api/Employees
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmpolyeesDTO>>> GetEmployees()
        {
            return await _db.Employees
                .Select(e => new EmpolyeesDTO
                {
                    EmployeeId = e.EmployeeId,
                    FullName = e.FullName,
                    Email = e.Email,
                    Image = e.Image,
                    PasswordHash = e.PasswordHash,
                    IsAdmin = e.IsAdmin,
                })
                .ToListAsync();
        }

        // GET: api/Employees/5
        [HttpGet("{id}")]
        public async Task<ActionResult<EmpolyeesDTO>> GetEmployee(int id)
        {
            var employee = await _db.Employees.FindAsync(id);

            if (employee == null)
            {
                return NotFound();
            }

            return new EmpolyeesDTO
            {
                FullName = employee.FullName,
                Email = employee.Email,
                Image = employee.Image,
                PasswordHash = employee.PasswordHash,
            };
        }



        /// <summary>
        /// ///////
        /// </summary>
        /// <param name="employeesDto"></param>
        /// <param name="imageFile"></param>
        /// <returns></returns>
        // POST: api/Employees
        [HttpPost]
        public async Task<ActionResult> CreateAdmin([FromForm] EmpolyeesDTO employeesDto, [FromForm] IFormFile imageFile)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(employeesDto.PasswordHash))
                {
                    return BadRequest("Password is required.");
                }

                var passwordHash = BCrypt.Net.BCrypt.HashPassword(employeesDto.PasswordHash);

                var employee = new Employee
                {
                    FullName = employeesDto.FullName,
                    Email = employeesDto.Email?.Trim().ToLower(),
                    PasswordHash = passwordHash,
                    Image = employeesDto.Image,
                    IsAdmin = false
                };

                if (imageFile != null && imageFile.Length > 0)
                {
                    var uploadsFolderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "EmployeeImages");
                    Directory.CreateDirectory(uploadsFolderPath);
                    var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(imageFile.FileName);
                    var filePath = Path.Combine(uploadsFolderPath, uniqueFileName);
                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await imageFile.CopyToAsync(fileStream);
                    }
                    employee.Image = Path.Combine("EmployeeImages", uniqueFileName);
                }

                _db.Employees.Add(employee);
                await _db.SaveChangesAsync();
                return CreatedAtAction(nameof(GetEmployee), new { id = employee.EmployeeId }, employee);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error occurred while creating admin.");
            }
        }







        /// <summary>
        /// ///////////
        /// </summary>
        /// <param name="id"></param>
        /// <param name="employeesDto"></param>
        /// <param name="imageFile"></param>
        /// <returns></returns>
        // PUT: api/Employees/5

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEmployee(int id, [FromForm] EmpolyeesDTO employeesDto, [FromForm] IFormFile? imageFile = null)
        {
            var employee = await _db.Employees.FindAsync(id);

            if (employee == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrWhiteSpace(employeesDto.FullName))
            {
                employee.FullName = employeesDto.FullName;
            }
            if (!string.IsNullOrWhiteSpace(employeesDto.Email))
            {
                employee.Email = employeesDto.Email;
            }
            if (!string.IsNullOrWhiteSpace(employeesDto.PasswordHash))
            {
                employee.PasswordHash = BCrypt.Net.BCrypt.HashPassword(employeesDto.PasswordHash);
            }

            if (imageFile != null && imageFile.Length > 0)
            {
                var uploadsFolderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "EmployeeImages");
                Directory.CreateDirectory(uploadsFolderPath);

                if (!string.IsNullOrEmpty(employee.Image))
                {
                    var oldFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", employee.Image);
                    if (System.IO.File.Exists(oldFilePath))
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                }

                var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(imageFile.FileName);
                var filePath = Path.Combine(uploadsFolderPath, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await imageFile.CopyToAsync(fileStream);
                }

                employee.Image = Path.Combine("EmployeeImages", uniqueFileName);
            }

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException) when (!_db.Employees.Any(e => e.EmployeeId == id))
            {
                return NotFound();
            }

            return Ok(new { message = "Employee updated successfully" });
        }




        /// <summary>
        /// /////////
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        // DELETE: api/Employees/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmployee(int id)
        {
            var employee = await _db.Employees.FindAsync(id);
            if (employee == null)
            {
                return NotFound();
            }

            _db.Employees.Remove(employee);
            await _db.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// /////////////////
        /// </summary>
        /// <param name="email"></param>
        /// <returns></returns>
        [HttpGet("CheckEmailExists")]
        public async Task<ActionResult<bool>> CheckEmailExists([FromQuery] string email)
        {
            var emailExists = await _db.Employees.AnyAsync(e => e.Email == email.Trim().ToLower());
            return Ok(emailExists);
        }

    }
}

