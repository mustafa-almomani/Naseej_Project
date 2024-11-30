using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Naseej_Project.DTOs;
using Naseej_Project.Models;

namespace Naseej_Project.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestimonialsController : ControllerBase
    {

        private readonly MyDbContext _db;

        public TestimonialsController(MyDbContext db)
        {
            _db = db;
        }


        //////////////////////////////////////////////////////


        [HttpGet("GetAllTestimonials")]
        public IActionResult GetAllTestimonial()
        {
            var GetAllTestimonials = _db.Testimonials.ToList();

            return Ok(GetAllTestimonials);
        }

        //////////////////////////////////////////////////////


        [HttpGet("GetTestimonial/{id}")]
        public IActionResult GetTestimonial(int id)
        {
            var Testimonialmessage = _db.Testimonials.FirstOrDefault(m => m.Id == id);



            return Ok(Testimonialmessage);
        }

        //////////////////////////////////////////////////////

        [HttpPost("AddTestimonial/{id}")]
        public IActionResult Addtestimonial(int id, [FromBody] TestimonialDTO addtestimonialDTO)
        {
            if (id == null || id == 0)
            {
                return BadRequest("The id is null or 0 here");
            }

            var user = _db.Users.FirstOrDefault(u => u.UserId == id);
            if (user == null)
            {
                return NotFound("User not found");
            }

            var addtestimonial = new Testimonial
            {
                UserId = id,
                Firstname = user.FirstName,
                Lastname = user.LastName,
                Email = user.Email,
                TheTestimonials = addtestimonialDTO.TheTestimonials
            };
            _db.Testimonials.Add(addtestimonial);
            _db.SaveChanges();
            return Ok();
        }
        [HttpGet("GetUserById")]

        public IActionResult GetUserById(int id)
        {

            var user = _db.Users.Where(x => x.UserId == id);

            return Ok(user);
        }

        /// /////////////////////////////////////////////////

        [HttpGet("GetTestimonialIsAccept")]

        public IActionResult getTestimonialIsAccept()
        {

            var Testimonial = _db.Testimonials.Where(x => x.Isaccepted == true);

            return Ok(Testimonial);

        }

        /////////////////////////////////////////////////

        [HttpPut("AcceptTestimonial/{id}")]
        public IActionResult AcceptTestimonial(int id)
        {
            if (id <= 0)
            {
                return BadRequest("You can not use 0 or negative value for id");
            }

            var testimonial = _db.Testimonials.FirstOrDefault(u => u.Id == id);

            if (testimonial == null)
            {
                return NotFound();
            }

            if (testimonial.Isaccepted == true)
            {
                return Conflict("This testimonial is already accepted."); // Return a conflict if already accepted
            }

            testimonial.Isaccepted = true; // Mark as accepted
            _db.Testimonials.Update(testimonial);
            _db.SaveChanges();

            return Ok();
        }


        /////////////////////////////////////////////////


        [HttpDelete("DeleteTestimonial/{id}")]
        public IActionResult DeleteTestimonial(int id)
        {
            if (id <= 0)
            {
                return BadRequest("You can not use 0 or negative value for id");
            }

            var testmonial = _db.Testimonials.FirstOrDefault(u => u.Id == id);
            if (testmonial == null)
            {
                return NotFound();
            }
            _db.Testimonials.Remove(testmonial);
            _db.SaveChanges();
            return Ok();
        }





        /// <summary>
        /// ///////
        /// </summary>
        /// <returns></returns>
        [HttpGet("GetTestimonialAdmin")]
        public IActionResult GetTestimonialAdmin()
        {
            var AdminTestimonials = _db.Testimonials
                .Select(t => new {
                    t.Id,
                    t.Firstname,
                    t.Lastname,
                    t.Email,
                    t.TheTestimonials,
                }).ToList();

            return Ok(AdminTestimonials);
        }

    }
}
