import React from 'react';

interface LinkItem {
  id: string;
  name: string;
  engName: string;
  url: string;
  description: string;
  category: string;
}

const importantLinksData: LinkItem[] = [
  {
    id: 'bfsa',
    name: 'বাংলাদেশ খাদ্য নিরাপত্তা কর্তৃপক্ষ (BFSA)',
    engName: 'Bangladesh Food Safety Authority',
    url: 'https://bfsa.gov.bd/',
    description: 'বাংলাদেশের খাদ্য নিরাপত্তা নিশ্চিতকরণে নিয়োজিত সার্বিক জাতীয় প্রশাসনিক সংস্থা।',
    category: 'বাংলাদেশ',
  },
  {
    id: 'dncrp',
    name: 'জাতীয় ভোক্তা-অধিকার সংরক্ষণ অধিদপ্তর (DNCRP)',
    engName: "National Consumers' Right Protection",
    url: 'https://dncrp.gov.bd/',
    description: 'ভোক্তাদের অধিকার সংরক্ষণ এবং খাদ্য পণ্যের মান নিয়ন্ত্রণে নিবেদিত সরকারি দপ্তর।',
    category: 'বাংলাদেশ',
  },
  {
    id: 'fda',
    name: 'ইউএস ফুড অ্যান্ড ড্রাগ অ্যাডমিনিস্ট্রেশন (FDA)',
    engName: 'U.S. Food and Drug Administration',
    url: 'https://www.fda.gov/',
    description: 'আন্তর্জাতিক মানদণ্ড, ওষুধ ও খাদ্যের নিরাপত্তা বিষয়ক তথ্যের বিশ্বস্ত উৎস।',
    category: 'আন্তর্জাতিক',
  },
  {
    id: 'fao',
    name: 'খাদ্য ও কৃষি সংস্থা (FAO)',
    engName: 'Food and Agriculture Organization',
    url: 'https://www.fao.org/food-safety/en',
    description: 'জাতিসংঘের খাদ্য নিরাপত্তা সংক্রান্ত আন্তর্জাতিক নির্দেশনা ও গবেষণা রিসোর্স।',
    category: 'আন্তর্জাতিক',
  },
  {
    id: 'nfsl',
    name: 'ন্যাশনাল ফুড সেফটি ল্যাবরেটরি (NFSL)',
    engName: 'National Food Safety Laboratory (IPH)',
    url: 'https://iph.gov.bd/national-food-safety-laboratory/',
    description: 'ইনস্টিটিউট অফ পাবলিক হেলথ (IPH) এর অধীনস্থ খাদ্য ও পানি মান পরীক্ষা কেন্দ্র।',
    category: 'বাংলাদেশ',
  },
];

export const ImportantLinks: React.FC = () => {
  return (
    <section id="important-links" className="py-12 bg-emerald-50/50 border-y border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-emerald-950">
            গুরুত্বপূর্ণ লিংক / Important Links
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            বিশ্বস্ত খাদ্য নিরাপত্তা ও ভোক্তা অধিকার সম্পর্কিত সরকারি ও আন্তর্জাতিক ওয়েবসাইটসমূহ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {importantLinksData.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    {item.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-500 mb-3">{item.engName}</p>
                <p className="text-sm text-slate-600 mb-6">{item.description}</p>
              </div>

              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                aria-label={`${item.name} এর ওয়েবসাইটে যান - নতুন ট্যাবে খুলবে`}
              >
                ওয়েবসাইট দেখুন
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500 bg-white/80 inline-block px-4 py-2 rounded-lg border border-slate-200">
            * বাহ্যিক সংস্থাগুলি স্বতন্ত্রভাবে পরিচালিত। এই লিংকগুলি সংযুক্ত করার অর্থ তাদের সাথে কোন আনুষ্ঠানিক অংশীদারিত্ব বা অনুমোদন নির্দেশ করে না।
          </p>
        </div>
      </div>
    </section>
  );
};