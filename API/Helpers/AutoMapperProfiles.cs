using API.DTOs;
using API.Entities;
using API.Extensions;
using AutoMapper;

namespace API.Helpers;

public class AutoMapperProfiles: Profile
{
    public AutoMapperProfiles()
    {
        CreateMap<AppUser, MemberDTO>()
        // set age (without querying the whole database) and the main photo for each member
        .ForMember( getTo => getTo.Age, options => options.MapFrom( user => user.DateOfBirth.CalculateAge()))
        .ForMember( getTo => getTo.PhotoUrl, options => options.MapFrom( user => user.Photos.FirstOrDefault( photo => photo.IsMain)!.Url));
        CreateMap<Photo, PhotoDTO>();
        CreateMap<MemberUpdateDTO, AppUser>();
        CreateMap<RegisterDTO, AppUser>();
        CreateMap<string, DateOnly>().ConvertUsing(s => DateOnly.Parse(s));
        CreateMap<Message, MessageDTO>()
        .ForMember(d => d.SenderPhotoUrl, o => o.MapFrom(s => s.Sender.Photos.FirstOrDefault(x => x.IsMain)!.Url))
        .ForMember(d => d.RecipientPhotoUrl, o => o.MapFrom(s => s.Recipient.Photos.FirstOrDefault(x => x.IsMain)!.Url));
        CreateMap<DateTime, DateTime>().ConvertUsing(d => DateTime.SpecifyKind(d, DateTimeKind.Utc));
        CreateMap<DateTime?, DateTime?>().ConvertUsing(d => d.HasValue?DateTime.SpecifyKind(d.Value,DateTimeKind.Utc) : null);
        CreateMap<Photo, PhotoForApprovalDTO>().ConvertUsing(p => new PhotoForApprovalDTO
        {
            Id = p.Id,
            Url = p.Url,
            IsApproved = p.IsApproved,
            Username = p.AppUser.UserName
        });
    }
}
