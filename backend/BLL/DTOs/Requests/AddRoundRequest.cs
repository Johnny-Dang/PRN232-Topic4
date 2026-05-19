using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class AddRoundRequest
    {
        public string RoundName { get; set; } = string.Empty;
        public int RoundOrder { get; set; }
        public DateTime SubmissionDeadline { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}
