FROM ruby:3.2.2-alpine AS chat

RUN apk --update add \
    build-base \
    tzdata \
    yarn \
    libc6-compat \
    postgresql-dev \
    postgresql-client \
    mysql-client \
    mysql-dev \
    redis \
    imagemagick \
    imagemagick-dev \
    curl \
    libjpeg-turbo \
    && rm -rf /var/cache/apk/*

WORKDIR /app

COPY Gemfile* /app/
RUN gem update --system 3.5.6
RUN gem install bundler -v $(tail -n 1 Gemfile.lock)
#RUN bundle config set path 'vendor/bundle'
RUN bundle check || bundle install

COPY package.json yarn.lock /app/
RUN yarn install --check-files

COPY . /app/
RUN apk add font-noto
ENTRYPOINT ["./docker-entrypoint.sh"]