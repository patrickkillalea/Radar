using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using System.Xml;
using System.Xml.Serialization;
using Radar.Models;
using System.IO;
using System.Xml.Linq;

namespace Radar.Controllers
{
    public class HomeController : Controller
    {

        public ActionResult Index(string returnUrl)
        {
            ViewBag.ReturnUrl = returnUrl;
            return View();
        }

        public void WriteXML(string circles)
        {             
            JavaScriptSerializer JSONSSerializer = new JavaScriptSerializer();
            List<Circle> circlesList = JSONSSerializer.Deserialize<List<Circle>>(circles);
            
            System.Xml.Serialization.XmlSerializer writer =
                new System.Xml.Serialization.XmlSerializer(typeof(List<Circle>));

            var path = AppDomain.CurrentDomain.BaseDirectory  + "Storage\\savedCircles.xml";
            System.IO.FileStream file = System.IO.File.Create(path);

            writer.Serialize(file, circlesList);
            file.Close();
        }

        public string LoadXML()
        {
            var path = AppDomain.CurrentDomain.BaseDirectory + "Storage\\savedCircles.xml";

            // Create an instance of the XmlSerializer specifying type.
            XmlSerializer serializer = new XmlSerializer(typeof(List<Circle>));

            // Create a TextReader to read the file. 
            FileStream fs = new FileStream(path, FileMode.OpenOrCreate);
            TextReader reader = new StreamReader(fs);
            
            // Declare an object variable of the type to be deserialized.
            List<Circle> c;

            // Use the Deserialize method to restore the object's state.
            c = (List<Circle>)serializer.Deserialize(reader);
            fs.Close();

            var circleData = new JavaScriptSerializer().Serialize(c); 

            return circleData;
        }
    }
}