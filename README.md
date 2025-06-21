# 📚 Medad - Arabic Digital Publishing Platform  

**Medad** is a platform designed to inspire creativity and support aspiring authors, connecting passionate readers with emerging writers in a vibrant literary community that celebrates Arabic storytelling.

---

## 🎯 Live Demo  
Experience the platform: https://medad-olive.vercel.app/ 

---

## ✨ Platform Highlights  

### For Writers ✍️  
- 🖋️ **Bring stories to life**: Write and publish in beautiful e-book format  
- 🎨 **Customizable covers**: Select images and colors for your book  
- 📚 **Genre selection**: Categorize your work for better discovery  
- 📂 **Chapter management system**: Easily add, delete, and reorganize chapters
  
### For Readers 📖  
- 🔍 **Discover diverse content**: Browse by genre, year, or popularity  
- 📖 **Flexible reading**: Choose between visual reading or audio narration  
- ❤️ **Personal library**: Save your favorite books for later  
- 🎧 **Text-to-speech**: Listen to books using our Arabic TTS API  

---

## 🛠 Technology Stack  

| Component       | Technology                         |
|-----------------|----------------------------------|
| Frontend        | HTML5, CSS3, JavaScript           |
| Backend         | Firebase (Auth, Firestore)        |
| APIs            | ImgBB (images hosting), Web Speech API       |
| Deployment      | Vercel                           |

---

## 🌟 Our Vision  
Medad bridges the gap between Arabic writers and readers by:  
- Providing writers with professional publishing tools  
- Offering readers high-quality Arabic content  
- Building a supportive literary community  
- Future plans include AI-assisted writing improvements  

---

## ⚠️ Development Notes  
The project uses absolute paths optimized for Vercel. For local testing:  
```bash
# Best option - matches production:
vercel dev

# Alternative (requires path adjustments):
# Change /path/ to ./path/ in all files
