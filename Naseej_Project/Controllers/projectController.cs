using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Naseej_Project.DTOs;
using Naseej_Project.Models;
using NuGet.Protocol.Core.Types;

namespace Naseej_Project.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class projectController : ControllerBase
    {
        private readonly MyDbContext _Db;
        public projectController(MyDbContext db)
        {
            _Db = db;
        }


        [HttpGet("allproject")]
        public IActionResult allproject()
        {
            var project = _Db.Projects.ToList();
            return Ok(project);
        }

        [HttpPost("addnewproject")]
        public IActionResult AddServices([FromForm] newprojectClass product)
        {
            var project = new Project
            {
                ProjectName = product.ProjectName,
                ProjectDescription = product.ProjectDescription,
                EmployeeId = product.EmployeeId,
                IsAccept = product.IsAccept
            };

            if (product.ProjectImage != null && product.ProjectImage.Length > 0)
            {
                try
                {
                    var uploadsFolderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "project");

                    if (!Directory.Exists(uploadsFolderPath))
                    {
                        Directory.CreateDirectory(uploadsFolderPath);
                    }

                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(product.ProjectImage.FileName);

                    var filePath = Path.Combine(uploadsFolderPath, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        product.ProjectImage.CopyTo(stream);
                    }

                    project.ProjectImage = $"{fileName}";
                }
                catch (Exception ex)
                {
                    return StatusCode(500, $"خطأ أثناء رفع الصورة: {ex.Message}");
                }
            }


            _Db.Projects.Add(project);
            _Db.SaveChanges();

            return Ok(project);
        }



        [HttpPut("editproject/{id}")]
        public IActionResult UpdateService(int id, [FromForm] newprojectClass obj)
        {
            var projects = _Db.Projects.Find(id);
            if (projects == null)
            {
                return NotFound("Service not found.");
            }

            try
            {
                projects.ProjectName = obj.ProjectName ?? projects.ProjectName;
                projects.ProjectDescription = obj.ProjectDescription ?? projects.ProjectDescription;



                var uploadsFolderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "project");

                if (!Directory.Exists(uploadsFolderPath))
                {
                    Directory.CreateDirectory(uploadsFolderPath);
                }

                if (obj.ProjectImage != null && obj.ProjectImage.Length > 0)
                {
                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(obj.ProjectImage.FileName);

                    var filePath = Path.Combine(uploadsFolderPath, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        obj.ProjectImage.CopyTo(stream);
                    }

                    projects.ProjectImage = $"{fileName}";
                }

                _Db.Projects.Update(projects);
                _Db.SaveChanges();

                return Ok("Service updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error while updating the projects: {ex.Message}");
            }
        }




        [HttpDelete("deletprojectid/{id}")]
        public IActionResult deleteproject(int id)
        {
            if (id <= 0)
            {
                return BadRequest();
            }
            var project = _Db.Projects.FirstOrDefault(c => c.ProjectId == id);
            if (project == null)
            {
                return NotFound();
            }

            _Db.Projects.Remove(project);
            _Db.SaveChanges();
            return Ok();
        }


        [HttpPut("editstetus/{id}")]
        public IActionResult editstetus(int id, editstetusprojectDTO DTO)
        {
            var edit = _Db.Projects.Where(x => x.ProjectId == id).FirstOrDefault();
            edit.IsAccept = DTO.IsAccept;
            _Db.Projects.Update(edit);
            _Db.SaveChanges();


            return Ok(edit);
        }




        [HttpGet("getprojectbyid/{id}")]
        public IActionResult getprpjectid(int id)
        {
            var project = _Db.Projects.Find(id);



            return Ok(project);
        }


        //////////////////////

        [HttpGet("getprojectAccepted")]
        public IActionResult getproject()
        {
            var sercice = _Db.Projects.Where(x => x.IsAccept == "Accept").ToList();
            return Ok(sercice);
        }


    }
}
