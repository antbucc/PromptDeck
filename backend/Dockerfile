# Use a current Node.js LTS on Debian Bookworm.
# (node:17.8 is end-of-life and its Debian Bullseye mirrors are flaky.)
FROM node:20-bookworm

# Set the working directory
WORKDIR /backend

# Make apt resilient to transient network / mirror failures:
#  - Acquire::Retries retries each individual download.
#  - the outer loop retries the whole update+install a few times with backoff.
RUN printf 'Acquire::Retries "5";\nAcquire::http::Timeout "30";\nAcquire::https::Timeout "30";\n' \
      > /etc/apt/apt.conf.d/80-retries; \
    n=0; until [ "$n" -ge 4 ]; do \
      apt-get update && apt-get install -y \
        python3 \
        python3-pip \
        timidity \
        libasound2-dev \
      && break; \
      n=$((n+1)); echo "apt attempt $n failed; retrying in 15s..."; sleep 15; \
    done; \
    [ "$n" -lt 4 ] || { echo "apt-get failed after 4 attempts"; exit 1; }; \
    rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Install Python dependencies. On Debian Bookworm the system Python is
# PEP 668 "externally managed", so --break-system-packages is required to
# install globally inside this container.
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Copy the rest of the working directory contents into the container
COPY . .

# Install Node.js dependencies (postinstall compiles TypeScript via tsc)
RUN npm install

# Command to run the application
CMD ["npm", "run", "start"]
