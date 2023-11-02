using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AuctionService.Data;
using AuctionService.DTOs;
using AuctionService.Entities;
using AutoMapper;
using Contracts;
using MassTransit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuctionService.Controllers
{
    [ApiController]
    [Route("api/auctions")]
    public class AuctionsControllers : ControllerBase
    {
        private readonly AuctionDbContext _context;
        private readonly IMapper _mapper;
        private readonly IPublishEndpoint _publishEndpoint;

        public AuctionsControllers(AuctionDbContext context, IMapper mapper, 
            IPublishEndpoint publishEndpoint)
        {
            _context = context;
            _mapper = mapper;
            _publishEndpoint = publishEndpoint;
        }

        [HttpGet]
        public async Task<ActionResult<List<AuctionDto>>> GetAllAuctions()
        {
            var auctions = await _context.Auctions
                    .Include(x => x.Item)
                    .OrderBy(x => x.Item.Make)
                    .ToListAsync();

            return _mapper.Map<List<AuctionDto>>(auctions);
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<AuctionDto>> GetAuctionById(Guid id)
        {
            var auction = await _context.Auctions
                    .Include(x => x.Item)
                    .FirstOrDefaultAsync(x => x.Id == id);

            if (auction == null)
                return NotFound();

            return _mapper.Map<AuctionDto>(auction);
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<AuctionDto>> CreateAuction(CreateAuctionDto auctionDto)
        {
            var auction = _mapper.Map<Auction>(auctionDto);

            auction.Seller = User.Identity.Name;

            _context.Auctions.Add(auction);

            var newAuction = _mapper.Map<AuctionDto>(auction);

            await _publishEndpoint.Publish(_mapper.Map<AuctionCreated>(newAuction));   

            var result = await _context.SaveChangesAsync() > 0;
            if (!result)
                return BadRequest("Could not save changes to the DB");
           
            return CreatedAtAction(nameof(GetAuctionById),
                new { auction.Id }, newAuction);
        }  

        [Authorize]
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateAuction(Guid id, UpdateAuctionDto updateAuctionDto)
        {
            var auction = await _context.Auctions
                    .Include(x => x.Item)
                    .FirstOrDefaultAsync(x => x.Id == id);

            if (auction == null)
                return NotFound();

            if(auction.Seller != User.Identity.Name)
            {
                return Forbid();
            }      

            auction.Item.Make = updateAuctionDto.Make ?? auction.Item.Make;    
            auction.Item.Model = updateAuctionDto.Model ?? auction.Item.Model;    
            auction.Item.Mileage = updateAuctionDto.Mileage ?? auction.Item.Mileage;   
            auction.Item.Color = updateAuctionDto.Color ?? auction.Item.Color;    
            auction.Item.Year = updateAuctionDto.Year ?? auction.Item.Year;    

            await _publishEndpoint.Publish(_mapper.Map<AuctionUpdated>(auction));    

            var result = await _context.SaveChangesAsync() > 0;
            if (!result)
                return BadRequest("Problem saving changes to the DB");

            return Ok();
        } 

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAuction(Guid id)
        {
            var auction = await _context.Auctions.FindAsync(id);

            if (auction == null)
                return NotFound();

            if(auction.Seller != User.Identity.Name)
            {
                return Forbid();
            }           

            _context.Remove(auction);

            await _publishEndpoint.Publish<AuctionDeleted>(new { Id = auction.Id.ToString() }); 

            var result = await _context.SaveChangesAsync() > 0;
            if (!result)
                return BadRequest("Problem deleting record from the DB");

            return Ok();
        }                          


    }
}