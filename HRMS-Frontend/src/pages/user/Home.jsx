import { Play, ChevronRight, Banknote, Eye, Target, MapPin, Mail, Smartphone } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';

const data = [
    { name: 'Sun', value: 30 },
    { name: 'Mon', value: 20 },
    { name: 'Tue', value: 40 },
    { name: 'Wed', value: 45 },
    { name: 'Thu', value: 25 },
    { name: 'Fri', value: 65 },
    { name: 'Sat', value: 80 },
];

export const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full text-gray-900 dark:text-gray-100 font-sans p-6 md:p-12">
            <div className="max-w-[1400px] mx-auto">

                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left Column */}
                    <div className="pr-4 xl:pr-12">
                        <h1 className="text-[2.5rem] xl:text-[5.5rem] font-bold leading-[1.05] tracking-tight text-[#141414] dark:text-white mb-8">
                            Investing<br />Simplified
                        </h1>

                        <p className="text-gray-600 dark:text-gray-450 text-[1.1rem] leading-relaxed mb-12 max-w-[28rem]">
                            Take command of your financial future and transcend to the life you've always envisioned. Unleash potential and master the art of investment with unparalleled ease and precision.
                        </p>

                        <div className="bg-[#eff2f6] dark:bg-slate-900/60 rounded-[2rem] p-8 xl:p-10">
                            <div className="flex justify-between items-center mb-10">
                                <div className="flex items-center gap-2">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="mb-1 text-[#2c3f5a] dark:text-sky-400">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                    <span className="text-[2rem] font-bold text-[#141414] dark:text-white tracking-tight">4.9</span>
                                </div>
                                <button
                                    onClick={() => navigate('/user/investments')}
                                    className="bg-[#2c3f5a] dark:bg-sky-500 text-white dark:text-slate-950 px-8 py-3.5 rounded-full text-sm font-bold tracking-wide hover:bg-[#1a2636] dark:hover:bg-sky-400 transition-colors cursor-pointer"
                                >
                                    GET STARTED
                                </button>
                            </div>
 
                            <div className="flex justify-between items-center gap-6">
                                <p className="text-[#141414] dark:text-white font-bold text-lg xl:text-xl leading-snug max-w-[280px]">
                                    Discover a World of Investment Opportunities: Start Growing Your Wealth Now
                                </p>
                                <div className="w-14 h-14 bg-[#141414] dark:bg-sky-500 hover:bg-black dark:hover:bg-sky-400 rounded-full flex items-center justify-center cursor-pointer transition-colors shrink-0 shadow-lg">
                                    <Play size={24} className="text-white dark:text-slate-950 fill-current ml-1" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="relative h-[500px] md:h-[600px] xl:h-[750px] w-full mt-12 lg:mt-0 lg:pl-12">
                        <img
                            src="/hero-image.png"
                            alt="Investment advisor"
                            className="w-full h-full object-cover rounded-[3rem]"
                        />

                        {/* Income Card */}
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:-left-8 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-none w-[90%] sm:w-[360px]">
                            <div className="flex justify-between items-start mb-1">
                                <div>
                                    <h3 className="text-xl font-bold text-[#141414] dark:text-white">Income</h3>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Higher Than Last week</p>
                                </div>
                                <span className="text-2xl font-bold text-[#141414] dark:text-white tracking-tight">1,500.98</span>
                            </div>

                            <div className="h-40 mt-6 w-full -ml-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: '#888' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: '#888' }}
                                            ticks={[20, 40, 60, 80]}
                                            domain={[0, 90]}
                                            tickFormatter={(val) => {
                                                if (val === 80) return '8 AM';
                                                if (val === 60) return '6 AM';
                                                if (val === 40) return '4 AM';
                                                if (val === 20) return '2 AM';
                                                return '';
                                            }}
                                        />
                                        <Bar
                                            dataKey="value"
                                            fill="#cbb7a9"
                                            radius={[4, 4, 4, 4]}
                                            barSize={10}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Opportunities Section */}
                <div className="mt-38 mb-16">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8">
                        <h2 className="text-[2.5rem] lg:text-[3.5rem] font-bold leading-tight text-[#141414] dark:text-white tracking-tight max-w-sm">
                            Explore Recent<br />Opportunities
                        </h2>
                        <div className="max-w-2xl">
                            <p className="text-gray-500 dark:text-gray-450 text-[1.05rem] leading-relaxed mb-6">
                                Unlock a Universe of Investment Opportunities<br />
                                Step into a realm where growth and opportunity converge. Our innovative platform opens doors to a meticulously curated selection of high-potential investments, crafted to diversify your portfolio and amplify your wealth.
                            </p>
                            <button className="inline-flex items-center text-[#2d425b] dark:text-sky-400 font-bold tracking-wide text-sm hover:underline">
                                LEARN MORE <ChevronRight size={16} className="ml-1 stroke-[3]" />
                            </button>
                        </div>
                    </div>

                    {/* Grid of Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                        {[
                            {
                                title: "International Art Museum",
                                image: "/art_museum.png"
                            },
                            {
                                title: "Web Application Investment Program",
                                image: "/coin_stack.png"
                            },
                            {
                                title: "Construction for School Building",
                                image: "/construction_workers.png"
                            },
                            {
                                title: "Autoparts Gear Manufacture",
                                image: "/auto_parts.png"
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-[2rem] p-4 flex flex-col sm:flex-row gap-6 hover:shadow-lg transition-shadow duration-300">
                                <div className="w-full sm:w-[220px] shrink-0 h-[220px]">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-3xl" />
                                </div>
                                <div className="flex flex-col justify-center py-2 pr-4">
                                    <h3 className="text-xl font-bold text-[#141414] dark:text-white mb-4 leading-tight">{item.title}</h3>
 
                                    <div className="space-y-2.5 mb-6">
                                        <div className="flex items-center gap-3 text-[13px] text-gray-500 dark:text-gray-400">
                                            <Banknote size={15} className="text-[#364968] dark:text-sky-400" /> Valuation $5M
                                        </div>
                                        <div className="flex items-center gap-3 text-[13px] text-gray-500 dark:text-gray-400">
                                            <Eye size={15} className="text-[#364968] dark:text-sky-400" /> 75 investors
                                        </div>
                                        <div className="flex items-center gap-3 text-[13px] text-gray-500 dark:text-gray-400">
                                            <Target size={15} className="text-[#364968] dark:text-sky-400" /> Target $500,000
                                        </div>
                                        <div className="flex items-center gap-3 text-[13px] text-gray-500 dark:text-gray-400">
                                            <MapPin size={15} className="text-[#364968] dark:text-sky-400" /> London, Uk
                                        </div>
                                    </div>
 
                                    <button className="inline-flex items-center text-[#2d425b] dark:text-sky-400 font-bold tracking-wide text-[13px] hover:underline mt-auto mr-auto">
                                        LEARN MORE <ChevronRight size={14} className="ml-1 stroke-[3]" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Smart Investment Solutions Section */}
            <div className="mt-32 mb-24 text-center">
                <span className="inline-block px-5 py-1.5 border border-gray-300 dark:border-slate-700 rounded-full text-xs font-bold tracking-widest text-[#141414] dark:text-white uppercase mb-8">
                    SOLUTION
                </span>

                <h2 className="text-[2.5rem] lg:text-[3.8rem] font-bold leading-tight text-[#141414] dark:text-white tracking-tight mb-6">
                    Smart Investment Solutions
                </h2>

                <p className="text-gray-500 dark:text-gray-405 text-[1.05rem] mb-14">
                    Maximize your returns with our expertly designed investment strategies.
                </p>

                <div className="w-[80%] h-[300px] md:h-[450px] lg:h-[580px] rounded-[2.5rem] overflow-hidden mb-16 shadow-sm mx-auto">
                    <img
                        src="/smart_solutions.png"
                        alt="Smart Investment Solutions"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-[3.5rem] font-bold text-[#141414] dark:text-white tracking-tight mb-1 leading-none">5k</span>
                        <span className="text-gray-500 dark:text-gray-405 font-medium text-[15px]">Investors</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-[3.5rem] font-bold text-[#141414] dark:text-white tracking-tight mb-1 leading-none">96+</span>
                        <span className="text-gray-500 dark:text-gray-405 font-medium text-[15px]">Assets</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-[3.5rem] font-bold text-[#141414] dark:text-white tracking-tight mb-1 leading-none">879</span>
                        <span className="text-gray-500 dark:text-gray-405 font-medium text-[15px]">Objects</span>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="relative w-[80%] mx-auto h-[350px] md:h-[600px] rounded-[2.5rem] overflow-hidden my-30 flex items-center justify-center text-center px-6 shadow-xl">
                <img
                    src="/skyscraper_cta.png"
                    alt="Skyscraper CTA"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-400/20 mix-blend-multiply"></div>

                <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
                        Unlock Exceptional Financial Gains
                    </h2>
                    <p className="text-gray-100 text-sm md:text-base leading-relaxed mb-10 max-w-xl font-medium drop-shadow-md">
                        Elevate your economic potential with our cutting-edge insights and steadfast guidance.
                    </p>
                    <button
                        onClick={() => navigate('/user/investments')}
                        className="bg-[#364d68] hover:bg-[#2c3f5a] text-white font-bold py-3.5 px-8 rounded-full text-[13px] transition-colors tracking-wide shadow-lg border border-[#445b77]/50 cursor-pointer"
                    >
                        GET STARTED
                    </button>
                </div>
            </div>

            {/* Footer Section */}
            {/* <footer className="mt-20 pt-16 pb-12 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-20 max-w-[1200px] mx-auto">

                    <div className="flex flex-col space-y-6">
                        <div className="w-12 h-12 bg-[#2d4356] rounded-full"></div>
                        <div className="flex items-center gap-4 text-[#141414] mt-2">
                            <a href="#" className="hover:text-gray-500 transition-colors">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                            </a>
                            <a href="#" className="hover:text-gray-500 transition-colors">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                            </a>
                            <a href="#" className="hover:text-gray-500 transition-colors">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                            </a>
                        </div>
                        <span className="text-sm text-[#141414] font-medium pt-2">Powerd by Sociallib</span>
                    </div>

                    <div className="flex flex-col space-y-4">
                        <h4 className="text-[14px] font-bold text-[#2d4356] tracking-wider mb-2">OFFICE</h4>
                        <p className="text-[14px] text-gray-500 leading-relaxed max-w-[200px]">
                            186, G Block, Road-7, South Point, Jersey, Network.
                        </p>
                        <div className="flex flex-col space-y-3 pt-4 text-[14px] text-gray-500">
                            <div className="flex items-center gap-3">
                                <Mail size={16} className="text-[#2d4356]" />
                                <a href="mailto:inqery@investa.io" className="hover:text-[#141414] transition-colors">inqery@investa.io</a>
                            </div>
                            <div className="flex items-center gap-3">
                                <Smartphone size={16} className="text-[#2d4356]" />
                                <span>+ 1 496 6696369</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-4">
                        <h4 className="text-[14px] font-bold text-[#2d4356] tracking-wider mb-2">MENU</h4>
                        <ul className="flex flex-col space-y-4 text-[14px] text-gray-500">
                            <li><a href="#" className="hover:text-[#141414] transition-colors">Service</a></li>
                            <li><a href="#" className="hover:text-[#141414] transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-[#141414] transition-colors">Partners</a></li>
                            <li><a href="#" className="hover:text-[#141414] transition-colors">Testimonials</a></li>
                        </ul>
                    </div>

                    <div className="flex flex-col space-y-4">
                        <h4 className="text-[14px] font-bold text-[#2d4356] tracking-wider mb-2">LINKS</h4>
                        <ul className="flex flex-col space-y-4 text-[14px] text-gray-500">
                            <li><a href="#" className="hover:text-[#141414] transition-colors">About us</a></li>
                            <li><a href="#" className="hover:text-[#141414] transition-colors">Contact</a></li>
                            <li><a href="#" className="hover:text-[#141414] transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-[#141414] transition-colors">Testimonials</a></li>
                        </ul>
                    </div>

                </div>
            </footer> */}

        </div>
    );
};