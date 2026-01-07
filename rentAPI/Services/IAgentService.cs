using RentApp.API.DTOs;

namespace RentApp.API.Services
{
    public interface IAgentService
    {
        Task<AgentCatalogDto> GetAgentsAsync(AgentFilterDto filter);
        Task<AgentDto?> GetAgentByIdAsync(int id);
        Task<bool> CreateAgentAsync(CreateAgentDto createDto);
        Task<bool> UpdateAgentAsync(int id, UpdateAgentDto updateDto);
        Task<List<string>> GetCitiesAsync();
        Task<List<string>> GetSpecialtiesAsync();
        Task<List<AgentReviewDto>> GetAgentReviewsAsync(int agentId);
        Task<bool> AddAgentReviewAsync(int agentId, int userId, CreateAgentReviewDto createDto);
    }
}