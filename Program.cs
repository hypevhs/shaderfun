using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using SFML;
using SFML.Graphics;
using SFML.Window;
using SFML.Audio;

namespace ShaderFun
{
    public static class Program
    {
        static RenderWindow window;
        static DateTime startTime;
        static Vector2f windowSize;
        static RenderStates shaderLetter;
        static RenderStates shaderBackground;
        static Dictionary<string, Texture> textures;
        const string SCROLLER = "sfml.net";
                const int LETTERWIDTH = 52;
                const int LETTERHEIGHT = 50;
                static readonly int scrollerWidth = (SCROLLER.Length * (LETTERHEIGHT + 12));
                static readonly int scrollerHeight = LETTERHEIGHT;
        static Vector2i scrollerPos = new Vector2i(10, 10);
        static Vector2i delta = new Vector2i(3, 2);
        static Texture backgroundTexture = new Texture(new Image(new Color[,] { { Color.White } }));

        static void Main(string[] args)
        {
            PreRun();
            LoadContentInitialize();

            while (window.IsOpen())
            {
                UpdateDraw(window);
            }
        }

        private static void PreRun()
        {
            startTime = DateTime.Now;

            if (!Shader.IsAvailable)
            {
                Console.WriteLine("No shader available. Update your grafix drivers or something.");
                Environment.Exit(263);
            }
        }

        private static void LoadContentInitialize()
        {
            window = new RenderWindow(
                new VideoMode(640, 480), "?");

            windowSize = new Vector2f(640, 480);
            window.SetFramerateLimit(60);
            window.Closed += (a, b) => { window.Close(); };
            window.Size = new Vector2u(640, 480);
            window.Resized += (a, b) => {
                windowSize = new Vector2f(b.Width, b.Height);
            };

            shaderLetter = new RenderStates()
            {
                Shader = Shader.FromString(null, new System.IO.StreamReader("letter.frag").ReadToEnd()),
                Transform = Transform.Identity,
            };

            shaderBackground = new RenderStates()
            {
                Shader = Shader.FromString(null, new System.IO.StreamReader("bg.frag").ReadToEnd()),
                Transform = Transform.Identity,
            };


            LoadLetters();
        }

        private static void LoadLetters()
        {
            textures = new Dictionary<string, Texture>();
            
            //get all pngs in ./alpha/
            string[] pngs = System.IO.Directory.GetFiles("resource", "*png");

            foreach (string file in pngs)
            {
                //get the char it represents
                string key = System.IO.Path.GetFileNameWithoutExtension(file);

                //windows filename limitations
                if (key == "!q")
                    key = "?";
                if (key == "!p")
                    key = ".";

                //load it
                textures.Add(key, new Texture(file));
            }

            Console.WriteLine("{0} textures loaded : {1}", textures.Count, string.Join("", textures.Keys));
        }

        private static void UpdateDraw(RenderWindow window)
        {
            window.DispatchEvents();
            window.Clear();

            shaderBackground.Shader.SetParameter("time", (float)SinceEpoch());
            shaderBackground.Shader.SetParameter("resolution", windowSize);

            Sprite backgroundSprite = new Sprite(backgroundTexture);
            backgroundSprite.Scale = new Vector2f(640, 480);
            window.Draw(backgroundSprite, shaderBackground);

            shaderLetter.Shader.SetParameter("time", (float)SinceEpoch());
            shaderLetter.Shader.SetParameter("resolution", windowSize);

            scrollerPos.X += delta.X;
            scrollerPos.Y += delta.Y;

            if (scrollerPos.X <= 0 || scrollerPos.X + scrollerWidth >= 640)
            {
                delta.X *= -1;
            }

            if (scrollerPos.Y <= 0 || scrollerPos.Y + scrollerHeight >= 480)
            {
                delta.Y *= -1;
            }

            DrawString(window, ToVector2f(scrollerPos));

            window.Display();
        }

        //outerShader is to be shaderGold, inner is shaderScan
        private static void DrawString(RenderWindow window, Vector2f where)
        {
            char[] cScroller = SCROLLER.ToLower().ToCharArray();

            //draw each char in the scroller text
            for (int si = 0; si < cScroller.Length; si++)
            {
                char charHere = cScroller[si];
                if (charHere == ' ') { continue; }

                Vector2f positionHere = new Vector2f(
                                        where.X + (si * (LETTERHEIGHT+12)),
                    where.Y
                );

                Texture textureHere = textures[charHere.ToString()];

                RectangleShape testShape = new RectangleShape()
                {
                    Position = positionHere,
                                        Size = new Vector2f(LETTERHEIGHT, LETTERWIDTH),
                    Texture = textureHere,
                };
                shaderLetter.Shader.SetParameter("tex", textureHere);
                window.Draw(testShape, shaderLetter);
            }
        }

        private static Vector2f UnitMousePosition()
        {
            Vector2i mp = Mouse.GetPosition(window);
            Vector2f unit = new Vector2f(
                mp.X / windowSize.X,
                mp.Y / windowSize.Y
            );
            return unit;
        }

        //take a unit vector and a "size" vector, multiply each component together
        static Vector2f UnitMultiply(Vector2f input, Vector2f units)
        {
            return new Vector2f(input.X * units.X, input.Y * units.Y);
        }

        static Vector2f ToVector2f(Vector2i input)
        {
            return new Vector2f(input.X, input.Y);
        }

        static float SinceEpoch()
        {
            double since = (DateTime.Now - startTime).TotalSeconds;
            float fsince = (float)since;
            return fsince;
        }
    }
}
