#!/bin/bash
# Run from the repo root on your Mac, BEFORE shutting down WordPress:
#   bash imports/download-images.sh
set -e
mkdir -p "assets/images/wp/2025/01" && curl -fsSL "https://silenceofthedrams.com/wp-content/uploads/2025/01/FOB.jpg" -o "assets/images/wp/2025/01/FOB.jpg"
mkdir -p "assets/images/wp/2025/01" && curl -fsSL "https://silenceofthedrams.com/wp-content/uploads/2025/01/berebarley2013-404x1024.webp" -o "assets/images/wp/2025/01/berebarley2013-404x1024.webp"
mkdir -p "assets/images/wp/2025/01" && curl -fsSL "https://silenceofthedrams.com/wp-content/uploads/2025/01/blackart4-512x1024.jpg" -o "assets/images/wp/2025/01/blackart4-512x1024.jpg"
mkdir -p "assets/images/wp/2025/01" && curl -fsSL "https://silenceofthedrams.com/wp-content/uploads/2025/01/bruichladdichgille.jpg" -o "assets/images/wp/2025/01/bruichladdichgille.jpg"
mkdir -p "assets/images/wp/2025/01" && curl -fsSL "https://silenceofthedrams.com/wp-content/uploads/2025/01/caledonian31.jpg" -o "assets/images/wp/2025/01/caledonian31.jpg"
mkdir -p "assets/images/wp/2025/01" && curl -fsSL "https://silenceofthedrams.com/wp-content/uploads/2025/01/longmorn15.webp" -o "assets/images/wp/2025/01/longmorn15.webp"
mkdir -p "assets/images/wp/2025/01" && curl -fsSL "https://silenceofthedrams.com/wp-content/uploads/2025/01/octofutures1-768x1024.jpg" -o "assets/images/wp/2025/01/octofutures1-768x1024.jpg"
mkdir -p "assets/images/wp/2025/01" && curl -fsSL "https://silenceofthedrams.com/wp-content/uploads/2025/01/trlkjacksingle-1024x1024.webp" -o "assets/images/wp/2025/01/trlkjacksingle-1024x1024.webp"
mkdir -p "assets/images/wp/2025/01" && curl -fsSL "https://silenceofthedrams.com/wp-content/uploads/2025/01/x4futures-512x1024.webp" -o "assets/images/wp/2025/01/x4futures-512x1024.webp"
mkdir -p "assets/images/wp/2025/02" && curl -fsSL "https://silenceofthedrams.com/wp-content/uploads/2025/02/octomorefuturesbeast.jpg" -o "assets/images/wp/2025/02/octomorefuturesbeast.jpg"
mkdir -p "assets/images/wp/2025/08" && curl -fsSL "https://silenceofthedrams.com/wp-content/uploads/2025/08/Rockndaal-03-01-Bottle-1.webp" -o "assets/images/wp/2025/08/Rockndaal-03-01-Bottle-1.webp"
mkdir -p "assets/images/wp/2025/08" && curl -fsSL "https://silenceofthedrams.com/wp-content/uploads/2025/08/Screenshot-2025-08-24-at-3.49.10-PM.png" -o "assets/images/wp/2025/08/Screenshot-2025-08-24-at-3.49.10-PM.png"
mkdir -p "assets/images/wp/2025/08" && curl -fsSL "https://silenceofthedrams.com/wp-content/uploads/2025/08/dramfool-leaky-laddie.jpeg" -o "assets/images/wp/2025/08/dramfool-leaky-laddie.jpeg"
mkdir -p "assets/images/wp/2025/09" && curl -fsSL "https://silenceofthedrams.com/wp-content/uploads/2025/09/Screenshot-2025-09-04-at-12.15.39-PM.png" -o "assets/images/wp/2025/09/Screenshot-2025-09-04-at-12.15.39-PM.png"
mkdir -p "assets/images/wp/2025/09" && curl -fsSL "https://silenceofthedrams.com/wp-content/uploads/2025/09/Screenshot-2025-09-06-at-7.54.36-AM.png" -o "assets/images/wp/2025/09/Screenshot-2025-09-06-at-7.54.36-AM.png"
mkdir -p "assets/images/wp/2025/09" && curl -fsSL "https://silenceofthedrams.com/wp-content/uploads/2025/09/Screenshot-2025-09-14-at-10.02.13-AM.png" -o "assets/images/wp/2025/09/Screenshot-2025-09-14-at-10.02.13-AM.png"
mkdir -p "assets/images/wp/2025/09" && curl -fsSL "https://silenceofthedrams.com/wp-content/uploads/2025/09/Screenshot-2025-09-20-at-10.49.15-AM.png" -o "assets/images/wp/2025/09/Screenshot-2025-09-20-at-10.49.15-AM.png"
mkdir -p "assets/images/wp/2025/09" && curl -fsSL "https://silenceofthedrams.com/wp-content/uploads/2025/09/thy.jpg" -o "assets/images/wp/2025/09/thy.jpg"
echo "Downloaded $(find assets/images/wp -type f | wc -l) images."
