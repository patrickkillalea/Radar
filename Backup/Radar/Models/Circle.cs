using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace Radar.Models
{
    public class Circle
    {
        [XmlElement]
        public string Name { get; set; }
        [XmlElement]
        public double x { get; set; }
        [XmlElement]
        public double y { get; set; }
        [XmlElement]
        public string Website { get; set; }
    }
}