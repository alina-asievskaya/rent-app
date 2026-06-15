namespace RentApp.API.DTOs
{
    public class CreateSupportReplyDto
    {
        public string Message { get; set; } = string.Empty;
    }

    public class SupportReplyDto
    {
        public int Id { get; set; }
        public int FeedbackId { get; set; }
        public string AdminName { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateOnly CreatedAt { get; set; }
    }
}