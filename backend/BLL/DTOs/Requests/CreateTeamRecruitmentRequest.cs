namespace BusinessLogicLayer.DTOs.Requests
{
    public class CreateTeamRecruitmentRequest
    {
        public string RoleNeeded { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Quantity { get; set; } = 1;
    }
}
